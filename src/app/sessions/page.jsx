'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Video,
  MessageCircle,
  Phone,
  ArrowRight,
  CheckCircle,
  XCircle,
  Loader2,
  Plus,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import useAuth from '@/lib/useAuth';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function getTimeUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  if (diff <= 0) return 'Now';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 24) return `in ${Math.floor(h / 24)}d`;
  if (h > 0) return `in ${h}h ${m}m`;
  return `in ${m}m`;
}

const STATUS_CONFIG = {
  upcoming: { label: 'Upcoming', color: 'text-blue-300', bg: 'bg-blue-500/10 border-blue-500/20', dot: 'bg-blue-400' },
  active:   { label: 'Live Now', color: 'text-green-300', bg: 'bg-green-500/10 border-green-500/20', dot: 'bg-green-400 animate-pulse' },
  completed:{ label: 'Completed', color: 'text-zinc-300', bg: 'bg-zinc-500/10 border-zinc-500/20', dot: 'bg-zinc-400' },
  cancelled:{ label: 'Cancelled', color: 'text-red-300', bg: 'bg-red-500/10 border-red-500/20', dot: 'bg-red-400' },
  paid:     { label: 'Confirmed', color: 'text-blue-300', bg: 'bg-blue-500/10 border-blue-500/20', dot: 'bg-blue-400' },
};

const MODE_ICONS = {
  video: Video,
  audio: Phone,
  chat: MessageCircle,
};

function SessionCard({ session, index }) {
  const router = useRouter();
  const cfg = STATUS_CONFIG[session.status] || STATUS_CONFIG.upcoming;
  const ModeIcon = MODE_ICONS[session.sessionType?.toLowerCase()] || Video;
  const timeUntil = getTimeUntil(session.scheduledAt);
  const canJoin = session.status === 'active' || session.status === 'upcoming';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="group relative bg-white/[0.035] hover:bg-white/[0.055] border border-white/10 hover:border-green-500/25 rounded-[22px] p-5 transition-all duration-300"
    >
      {/* Status badge */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center text-white font-bold shadow-lg shrink-0">
            {session.guideName?.charAt(0) || 'G'}
          </div>
          <div>
            <p className="font-semibold text-white text-sm leading-tight">
              {session.guideName || 'Guide'}
            </p>
            <p className="text-[11px] text-zinc-400 mt-0.5 capitalize">
              {session.domain || session.selectedIssue || 'Life Guidance'}
            </p>
          </div>
        </div>

        <span className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium ${cfg.bg} ${cfg.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
      </div>

      {/* Session Info */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-[10px] text-zinc-500 mb-1 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Date
          </p>
          <p className="text-xs text-white font-medium">
            {formatDate(session.scheduledAt || session.sessionDate)}
          </p>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-[10px] text-zinc-500 mb-1 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Time
          </p>
          <p className="text-xs text-white font-medium">
            {formatTime(session.scheduledAt) || session.sessionTime || '—'}
          </p>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-[10px] text-zinc-500 mb-1 flex items-center gap-1">
            <ModeIcon className="w-3 h-3" /> Mode
          </p>
          <p className="text-xs text-white font-medium capitalize">
            {session.sessionType || 'Video'}
          </p>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-[10px] text-zinc-500 mb-1">Amount</p>
          <p className="text-xs text-white font-semibold text-green-400">
            ₹{session.amount || session.price || '—'}
          </p>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center gap-2">
        {canJoin && session.sessionId && (
          <button
            onClick={() => router.push(`/session/${session.sessionId}`)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-sm font-semibold transition-all active:scale-95"
          >
            {session.status === 'active' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                Join Live Session
              </>
            ) : (
              <>
                <Video className="w-4 h-4" />
                {timeUntil ? `Join ${timeUntil}` : 'Enter Session'}
              </>
            )}
          </button>
        )}

        {session.sessionId && (
          <button
            onClick={() => router.push(`/session/${session.sessionId}`)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border border-white/10 hover:bg-white/8 text-zinc-300 text-sm transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            {canJoin ? 'Chat' : 'View'}
          </button>
        )}

        {!session.sessionId && (
          <div className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 text-zinc-500 text-sm">
            Awaiting confirmation
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function SessionsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user?.uid || !db) return;

    const load = async () => {
      try {
        setLoading(true);
        const ref = collection(db, 'bookings');
        const q = query(ref, where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setBookings(data);
      } catch (e) {
        console.error('Sessions fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  const filtered = bookings.filter((b) => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return ['upcoming', 'active', 'paid', 'confirmed'].includes(b.status);
    return b.status === filter;
  });

  if (authLoading || (loading && !bookings.length)) {
    return (
      <main className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-7 h-7 text-green-500 animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* HEADER */}
      <section className="border-b border-white/6 bg-[#050505]/95 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">My Sessions</h1>
              <p className="text-sm text-zinc-500 mt-0.5">
                {bookings.length} session{bookings.length !== 1 ? 's' : ''} total
              </p>
            </div>
            <button
              onClick={() => router.push('/guides')}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-500 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Book New
            </button>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setFilter(t.id)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filter === t.id
                    ? 'bg-green-600 text-white'
                    : 'border border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="max-w-4xl mx-auto px-4 py-6 pb-28">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Calendar className="w-9 h-9 text-zinc-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">No sessions yet</h3>
              <p className="text-sm text-zinc-500 max-w-xs">
                Book a session with one of our guides to get started.
              </p>
            </div>
            <button
              onClick={() => router.push('/guides')}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-semibold text-white text-sm transition-all"
            >
              Browse Guides
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((session, i) => (
              <SessionCard key={session.id} session={session} index={i} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
