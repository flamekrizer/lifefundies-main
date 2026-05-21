'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import useAuth from '@/lib/useAuth';
import { getGuideById } from '@/lib/guideService';
import ChatBox from '@/components/ChatBox';
import VideoRoom from '@/components/VideoRoom';
import {
  Video,
  MessageCircle,
  Calendar,
  Clock,
  Shield,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';

function Countdown({ scheduledAt }) {
  const [diff, setDiff] = useState(null);

  useEffect(() => {
    const tick = () => {
      const target = new Date(scheduledAt);
      const now = new Date();
      const ms = target - now;
      if (ms <= 0) { setDiff(null); return; }
      const h = Math.floor(ms / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      setDiff({ h, m, s, ms });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [scheduledAt]);

  if (!diff) return null;

  return (
    <div className="flex items-center gap-4">
      {[['h', diff.h], ['m', diff.m], ['s', diff.s]].map(([label, val]) => (
        <div key={label} className="text-center">
          <div className="text-2xl font-bold text-white tabular-nums w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
            {String(val).padStart(2, '0')}
          </div>
          <div className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">{label}</div>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    upcoming: { label: 'Upcoming', cls: 'bg-blue-500/15 text-blue-300 border-blue-500/25', dot: 'bg-blue-400' },
    active:   { label: 'Active',   cls: 'bg-green-500/15 text-green-300 border-green-500/25', dot: 'bg-green-400 animate-pulse' },
    completed:{ label: 'Completed',cls: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/25', dot: 'bg-zinc-400' },
    cancelled:{ label: 'Cancelled',cls: 'bg-red-500/15 text-red-300 border-red-500/25', dot: 'bg-red-400' },
  };
  const s = map[status] || map.upcoming;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

export default function SessionPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [booking, setBooking] = useState(null);
  const [guide, setGuide] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('video'); // 'video' | 'chat'
  const [sessionLeft, setSessionLeft] = useState(false);

  // Auth guard
  useEffect(() => {
    if (id === 'demo-session') return; // Allow bypass for public demo session
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router, id]);

  // Real-time session listener
  useEffect(() => {
    if (!id || !db || id === 'demo-session') return;
    const sessionRef = doc(db, 'sessions', id);
    const unsub = onSnapshot(sessionRef, (snap) => {
      if (snap.exists()) setSession({ id: snap.id, ...snap.data() });
    });
    return () => unsub();
  }, [id]);

  // Load booking + guide on mount
  useEffect(() => {
    if (!id || !db) return;

    if (id === 'demo-session') {
      setSession({
        id: 'demo-session',
        bookingId: 'demo-booking',
        userId: user?.uid || 'demo-user-id',
        guideId: 'guide-mental-health-1',
        scheduledAt: new Date().toISOString(), // Start now
        duration: 30,
        status: 'active',
        videoRoomId: 'lf-session-demo-session',
        chatEnabled: true,
        notes: 'Demo session notes: Priya recommends deep breathing techniques and setting boundaries at work.',
        createdAt: new Date(),
      });
      setBooking({
        id: 'demo-booking',
        userId: user?.uid || 'demo-user-id',
        guideId: 'guide-mental-health-1',
        sessionDuration: 30,
        sessionType: 'video',
        amount: 399,
        status: 'active',
      });
      setGuide({
        id: 'guide-mental-health-1',
        name: 'Priya Sharma',
        bio: 'Licensed therapist with 8 years experience. Specializing in anxiety & stress.',
        price: 399,
        rating: 4.9,
      });
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        const sessionSnap = await getDoc(doc(db, 'sessions', id));
        if (!sessionSnap.exists()) throw new Error('Session not found');

        const sessionData = { id: sessionSnap.id, ...sessionSnap.data() };
        setSession(sessionData);

        if (sessionData.bookingId) {
          const bookingSnap = await getDoc(doc(db, 'bookings', sessionData.bookingId));
          if (bookingSnap.exists()) {
            const bData = { id: bookingSnap.id, ...bookingSnap.data() };
            setBooking(bData);
            const guideData = await getGuideById(bData.guideId);
            setGuide(guideData);
          }
        }
      } catch (err) {
        setError(err.message || 'Unable to load session');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, user]);

  const isSessionLive = session?.status === 'active' || session?.status === 'upcoming';
  const sessionTime = session?.scheduledAt
    ? new Date(session.scheduledAt).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : null;

  if (loading || authLoading) {
    return (
      <main className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
          <p className="text-zinc-400 text-sm">Loading your session...</p>
        </div>
      </main>
    );
  }

  if (error || !session) {
    return (
      <main className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
        <div className="max-w-sm w-full bg-white/[0.03] border border-red-500/20 rounded-2xl p-8 text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-white mb-2">Session Not Found</h2>
          <p className="text-sm text-zinc-400 mb-6">{error || 'This session does not exist.'}</p>
          <button
            onClick={() => router.push('/sessions')}
            className="w-full py-3 rounded-xl bg-white/8 text-white text-sm font-medium hover:bg-white/12 transition"
          >
            View My Sessions
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* TOP BAR */}
      <header className="sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-xl border-b border-white/8">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
          <button
            onClick={() => router.push('/sessions')}
            className="p-2 rounded-xl hover:bg-white/8 transition text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center font-bold text-sm text-white shrink-0">
              {guide?.name?.charAt(0) || 'G'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                Session with {guide?.name || booking?.guideId || 'Your Guide'}
              </p>
              {sessionTime && (
                <p className="text-[11px] text-zinc-500 truncate">{sessionTime}</p>
              )}
            </div>
          </div>

          <StatusBadge status={session.status} />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* UPCOMING COUNTDOWN */}
        {session.status === 'upcoming' && session.scheduledAt && (
          <div className="mb-6 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6">
            <p className="text-sm text-blue-300 mb-3 font-medium">⏰ Session starts in</p>
            <Countdown scheduledAt={session.scheduledAt} />
            <p className="text-xs text-zinc-500 mt-4">
              You can join the session 5 minutes before scheduled time
            </p>
          </div>
        )}

        {/* COMPLETED BANNER */}
        {session.status === 'completed' && (
          <div className="mb-6 rounded-2xl border border-green-500/20 bg-green-500/5 p-5 flex items-center gap-4">
            <CheckCircle className="w-8 h-8 text-green-400 shrink-0" />
            <div>
              <p className="font-semibold text-green-300">Session Completed</p>
              <p className="text-sm text-zinc-400 mt-0.5">
                Great session! Your chat history is saved below.
              </p>
            </div>
          </div>
        )}

        {/* MAIN LAYOUT: Video + Chat */}
        {/* Mobile: Tabs | Desktop: Side by side */}
        <div className="flex flex-col lg:flex-row gap-4 h-full">

          {/* Mobile Tab Switcher */}
          <div className="flex lg:hidden border border-white/10 rounded-2xl p-1 bg-white/[0.03] mb-2">
            {[
              { id: 'video', label: 'Video', icon: Video },
              { id: 'chat', label: 'Chat', icon: MessageCircle },
            ].map(({ id: tabId, label, icon: Icon }) => (
              <button
                key={tabId}
                onClick={() => setActiveTab(tabId)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tabId
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* VIDEO PANEL */}
          <div
            className={`lg:flex-[1.5] ${
              activeTab === 'chat' ? 'hidden lg:block' : 'block'
            }`}
            style={{ minHeight: '420px' }}
          >
            {isSessionLive && !sessionLeft ? (
              <VideoRoom
                sessionId={id}
                userName={user?.displayName || user?.email?.split('@')[0] || 'User'}
                guideName={guide?.name}
                onLeave={() => setSessionLeft(true)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[360px] bg-[#0a0a0a] rounded-2xl border border-white/8 gap-5 p-8 text-center">
                {session.status === 'completed' || sessionLeft ? (
                  <>
                    <CheckCircle className="w-12 h-12 text-green-400" />
                    <p className="text-zinc-300 font-medium">Session ended</p>
                    <p className="text-sm text-zinc-500">Your conversation is saved in Chat.</p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <Video className="w-8 h-8 text-zinc-500" />
                    </div>
                    <p className="text-zinc-400 text-sm max-w-[220px]">
                      Video will be available when your session starts.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* CHAT PANEL */}
          <div
            className={`lg:flex-1 ${
              activeTab === 'video' ? 'hidden lg:flex' : 'flex'
            } flex-col`}
            style={{ minHeight: '420px' }}
          >
            <ChatBox
              sessionId={id}
              currentUser={user}
              guideName={guide?.name}
            />
          </div>
        </div>

        {/* SESSION DETAILS CARD */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Calendar, label: 'Date', value: sessionTime?.split(',')[0] || '—' },
            { icon: Clock, label: 'Duration', value: booking?.sessionDuration ? `${booking.sessionDuration} min` : '60 min' },
            { icon: MessageCircle, label: 'Mode', value: booking?.sessionType || 'Video' },
            { icon: Shield, label: 'Privacy', value: 'Private & Secure' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-white/[0.03] border border-white/8 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-green-400" />
                <span className="text-[11px] text-zinc-500 uppercase tracking-wide">{label}</span>
              </div>
              <p className="text-sm font-semibold text-white truncate">{value}</p>
            </div>
          ))}
        </div>

        {/* Private Notes */}
        <div className="mt-4 bg-white/[0.02] border border-white/8 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-zinc-300 mb-1">📝 Session Notes</h3>
          <p className="text-sm text-zinc-500">
            {session.notes || 'No notes yet. Your guide may add session notes after the call.'}
          </p>
        </div>
      </div>
    </main>
  );
}
