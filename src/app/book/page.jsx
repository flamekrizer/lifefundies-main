'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Star, ArrowRight, ArrowLeft, Video, Phone, MessageCircle,
  Calendar, Clock, Check, IndianRupee, Loader2, Shield, ChevronLeft, X,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import useAuth from '@/lib/useAuth';
import { getGuideSlots } from '@/lib/bookingService';
import { createBookingDraft, markBookingPaidAndCreateSession } from '@/lib/bookingService';

// ─── STEP INDICATOR ──────────────────────────────────────────────────────────
function StepBar({ step }) {
  const steps = ['Choose Guide', 'Pick Slot', 'Select Mode', 'Confirm & Pay'];
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = step > idx;
        const active = step === idx;
        return (
          <div key={label} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                done ? 'bg-green-600 text-white' : active ? 'bg-green-600 text-white ring-4 ring-green-500/20' : 'bg-white/8 text-zinc-500'
              }`}>
                {done ? <Check className="w-4 h-4" /> : idx}
              </div>
              <span className={`text-[10px] mt-1 hidden sm:block ${active ? 'text-green-400 font-medium' : 'text-zinc-600'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-2 ${step > idx ? 'bg-green-600' : 'bg-white/8'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── GUIDE SELECTOR ──────────────────────────────────────────────────────────
function GuideSelector({ onSelect }) {
  const [guides, setGuides] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) { setLoading(false); return; }
    const load = async () => {
      try {
        const q = query(collection(db, 'guides'), where('isActive', '==', true));
        const snap = await getDocs(q);
        setGuides(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b)=>(b.rating||0)-(a.rating||0)));
      } catch(e) { console.error(e); } finally { setLoading(false); }
    };
    load();
  }, []);

  const filtered = guides.filter(g =>
    !search ||
    g.name?.toLowerCase().includes(search.toLowerCase()) ||
    g.domainIds?.some(d => d.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-7 h-7 text-green-500 animate-spin" />
    </div>
  );

  return (
    <div>
      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search guides or topics..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-green-500/50"
        />
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filtered.map(guide => (
          <motion.button
            key={guide.id}
            onClick={() => onSelect(guide)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="text-left flex items-center gap-4 p-4 rounded-2xl bg-white/[0.035] border border-white/10 hover:border-green-500/30 hover:bg-white/[0.055] transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center text-white font-bold text-lg shrink-0">
              {guide.name?.charAt(0) || 'G'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-sm">{guide.name}</span>
                <span className="flex items-center gap-1 text-[11px] text-yellow-300 bg-yellow-500/10 border border-yellow-500/15 px-2 py-0.5 rounded-full">
                  <Star className="w-3 h-3 fill-yellow-300" /> {guide.rating || '4.8'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">{guide.bio || 'Life guidance expert'}</p>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {guide.domainIds?.slice(0,3).map(d => (
                  <span key={d} className="text-[10px] bg-white/5 border border-white/8 px-2 py-0.5 rounded-full text-zinc-300 capitalize">{d.replaceAll('-',' ')}</span>
                ))}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[11px] text-zinc-500">from</p>
              <p className="text-lg font-bold text-green-400">₹{guide.price || 399}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500 shrink-0" />
          </motion.button>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-zinc-500 py-10 text-sm">No guides found</p>
        )}
      </div>
    </div>
  );
}

// ─── SLOT PICKER ─────────────────────────────────────────────────────────────
function SlotPicker({ guide, onSelect, selectedSlot }) {
  const [slots, setSlots] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!guide?.id) return;
    const load = async () => {
      try {
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];
        const nextWeek = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
        const raw = await getGuideSlots(guide.id, today, nextWeek);
        const grouped = {};
        raw.forEach(s => { if (!grouped[s.date]) grouped[s.date] = []; grouped[s.date].push(s); });
        setSlots(grouped);
      } catch(e) { console.error(e); } finally { setLoading(false); }
    };
    load();
  }, [guide?.id]);

  const fmtDate = (d) => {
    const dt = new Date(d);
    const today = new Date(); const tmr = new Date(today); tmr.setDate(tmr.getDate()+1);
    if (dt.toDateString()===today.toDateString()) return 'Today';
    if (dt.toDateString()===tmr.toDateString()) return 'Tomorrow';
    return dt.toLocaleDateString('en-IN',{weekday:'short',month:'short',day:'numeric'});
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 text-green-500 animate-spin"/></div>;

  if (Object.keys(slots).length === 0) {
    return (
      <div className="text-center py-16">
        <Calendar className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
        <p className="text-zinc-400 font-medium">No slots available right now</p>
        <p className="text-sm text-zinc-600 mt-1">Check back in a few days or choose another guide</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(slots).map(([date, timeSlots]) => (
        <div key={date}>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-green-400" />
            <span className="text-sm font-semibold text-white">{fmtDate(date)}</span>
            <span className="text-xs text-zinc-500">{new Date(date).toLocaleDateString('en-IN',{weekday:'long'})}</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {timeSlots.map(slot => (
              <button
                key={slot.id}
                onClick={() => onSelect(slot)}
                className={`relative p-3 rounded-xl border-2 transition-all text-center ${
                  selectedSlot?.id === slot.id
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-white/8 bg-white/[0.03] hover:border-green-500/40 hover:bg-white/5'
                }`}
              >
                <Clock className="w-3.5 h-3.5 mx-auto mb-1 text-zinc-400" />
                <p className="text-xs font-semibold text-white">{slot.time}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">{slot.duration}m</p>
                {selectedSlot?.id === slot.id && (
                  <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── MODE SELECTOR ───────────────────────────────────────────────────────────
function ModeSelector({ guide, selected, onSelect }) {
  const modes = [
    { id: 'video', label: 'Video Call', desc: 'Face-to-face with your guide', icon: Video, multiplier: 1 },
    { id: 'audio', label: 'Audio Call', desc: 'Voice only, comfortable & private', icon: Phone, multiplier: 0.8 },
    { id: 'chat', label: 'Chat Only', desc: 'Text based, at your own pace', icon: MessageCircle, multiplier: 0.6 },
  ];

  return (
    <div className="space-y-3">
      {modes.map(mode => {
        const price = Math.round((guide?.price || 399) * mode.multiplier);
        const active = selected?.id === mode.id;
        return (
          <button
            key={mode.id}
            onClick={() => onSelect({ ...mode, price })}
            className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left ${
              active ? 'border-green-500 bg-green-500/8' : 'border-white/8 bg-white/[0.03] hover:border-green-500/30'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${active ? 'bg-green-600' : 'bg-white/8'}`}>
              <mode.icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white">{mode.label}</p>
              <p className="text-xs text-zinc-400 mt-0.5">{mode.desc}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xl font-bold text-green-400">₹{price}</p>
              <p className="text-[10px] text-zinc-500">per session</p>
            </div>
            {active && <Check className="w-5 h-5 text-green-400 shrink-0" />}
          </button>
        );
      })}
    </div>
  );
}

// ─── CONFIRM & PAY ───────────────────────────────────────────────────────────
function ConfirmPay({ guide, slot, mode, issue, setIssue, onPay, loading, error }) {
  return (
    <div className="space-y-5">
      {/* Summary card */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] divide-y divide-white/8 overflow-hidden">
        {[
          { label: 'Guide', value: guide?.name },
          { label: 'Date', value: slot?.date ? new Date(slot.date).toLocaleDateString('en-IN',{dateStyle:'long'}) : '—' },
          { label: 'Time', value: slot?.time || '—' },
          { label: 'Duration', value: slot?.duration ? `${slot.duration} minutes` : '—' },
          { label: 'Mode', value: mode?.label },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between px-5 py-3">
            <span className="text-sm text-zinc-500">{label}</span>
            <span className="text-sm font-medium text-white">{value}</span>
          </div>
        ))}
        <div className="flex items-center justify-between px-5 py-4 bg-green-500/5">
          <span className="font-semibold text-white">Total</span>
          <span className="text-2xl font-bold text-green-400">₹{mode?.price}</span>
        </div>
      </div>

      {/* Issue textarea */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          What would you like to discuss? <span className="text-zinc-500">(optional)</span>
        </label>
        <textarea
          value={issue}
          onChange={e => setIssue(e.target.value)}
          rows={3}
          placeholder="Share a brief description to help your guide prepare..."
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-green-500/50 resize-none"
        />
      </div>

      {/* Trust badges */}
      <div className="flex flex-wrap gap-3">
        {['🔒 Secure payment', '🔐 Private session', '↩️ Easy rescheduling'].map(b => (
          <span key={b} className="text-xs text-zinc-400 bg-white/5 border border-white/8 rounded-full px-3 py-1.5">{b}</span>
        ))}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300">{error}</div>
      )}

      <button
        onClick={onPay}
        disabled={loading}
        className="w-full py-4 rounded-2xl bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold text-base flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
      >
        {loading ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
        ) : (
          <><IndianRupee className="w-5 h-5" /> Pay ₹{mode?.price} & Confirm</>
        )}
      </button>
    </div>
  );
}

// ─── MAIN BOOK PAGE ───────────────────────────────────────────────────────────
function BookPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const [step, setStep] = useState(1);
  const [guide, setGuide] = useState(null);
  const [slot, setSlot] = useState(null);
  const [mode, setMode] = useState(null);
  const [issue, setIssue] = useState('');
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');

  // Pre-fill guide from query param
  useEffect(() => {
    const gId = searchParams.get('guide');
    if (!gId || !db) return;
    getDoc(doc(db, 'guides', gId)).then(snap => {
      if (snap.exists()) { setGuide({ id: snap.id, ...snap.data() }); setStep(2); }
    });
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login?redirect=/book');
  }, [authLoading, user, router]);

  const handlePay = async () => {
    if (!user || !guide || !slot || !mode) { setPayError('Please complete all steps.'); return; }
    try {
      setPaying(true); setPayError('');

      // 1. Create booking draft in Firestore
      const booking = await createBookingDraft({
        userId: user.uid,
        guideId: guide.id,
        slotId: slot.id,
        domain: guide.domainIds?.[0] || 'life-advice',
        issueSummary: issue || '',
        sessionType: mode.id,
        amount: mode.price,
      });

      // 2. Create Cashfree order via backend
      const orderRes = await fetch('/api/cashfree/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: mode.price,
          guideName: guide.name,
          customerDetails: {
            id: user.uid,
            name: user.displayName || '',
            email: user.email || '',
            phone: user.phoneNumber || '',
          },
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Payment setup failed');

      // 3. Open Cashfree checkout
      const cashfree = window.Cashfree?.({ mode: process.env.NEXT_PUBLIC_CASHFREE_MODE || 'sandbox' });
      if (!cashfree) throw new Error('Cashfree not loaded. Please refresh.');

      cashfree.checkout({
        paymentSessionId: orderData.paymentSessionId,
        returnUrl: `${window.location.origin}/sessions?payment=success`,
      }).then(async (result) => {
        if (result.error) {
          setPayError(result.error.message || 'Payment failed');
        } else {
          // Mark paid + create session
          await markBookingPaidAndCreateSession({
            bookingId: booking.id,
            orderId: orderData.orderId,
            paymentId: result.paymentDetails?.paymentId || 'cf_pay',
            paymentStatus: 'SUCCESS',
          });
          router.push('/sessions?payment=success');
        }
      });
    } catch (err) {
      console.error('Pay error:', err);
      setPayError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  const canProceed = () => {
    if (step === 2) return !!slot;
    if (step === 3) return !!mode;
    return true;
  };

  if (authLoading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="w-7 h-7 text-green-500 animate-spin" /></div>;

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* TOP NAV */}
      <header className="sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-xl border-b border-white/8">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-4">
          <button
            onClick={() => step > 1 ? setStep(s => s - 1) : router.push('/guides')}
            className="p-2 rounded-xl hover:bg-white/8 transition text-zinc-400"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold text-white flex-1">Book a Session</h1>
          <span className="text-xs text-zinc-500">Step {step} of 4</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <StepBar step={step} />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {step === 1 && (
              <div>
                <h2 className="text-xl font-bold mb-1">Choose your guide</h2>
                <p className="text-sm text-zinc-400 mb-6">Pick someone who resonates with your situation</p>
                <GuideSelector onSelect={(g) => { setGuide(g); setSlot(null); setMode(null); setStep(2); }} />
              </div>
            )}

            {step === 2 && guide && (
              <div>
                <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-white/[0.03] border border-white/8">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center font-bold text-white">
                    {guide.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{guide.name}</p>
                    <p className="text-xs text-zinc-400">Select an available time slot</p>
                  </div>
                  <button onClick={() => { setGuide(null); setStep(1); }} className="ml-auto p-1.5 rounded-lg hover:bg-white/8 text-zinc-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <SlotPicker guide={guide} onSelect={setSlot} selectedSlot={slot} />
              </div>
            )}

            {step === 3 && guide && (
              <div>
                <h2 className="text-xl font-bold mb-1">Choose session mode</h2>
                <p className="text-sm text-zinc-400 mb-6">Pick the format that works best for you</p>
                <ModeSelector guide={guide} selected={mode} onSelect={setMode} />
              </div>
            )}

            {step === 4 && guide && slot && mode && (
              <div>
                <h2 className="text-xl font-bold mb-1">Confirm & Pay</h2>
                <p className="text-sm text-zinc-400 mb-6">Review your booking before payment</p>
                <ConfirmPay
                  guide={guide} slot={slot} mode={mode}
                  issue={issue} setIssue={setIssue}
                  onPay={handlePay} loading={paying} error={payError}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* NAV BUTTONS */}
        {step < 4 && (
          <div className="mt-8 flex gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="flex-1 py-3 rounded-xl border border-white/10 text-zinc-300 hover:bg-white/5 text-sm font-medium transition"
              >
                Back
              </button>
            )}
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition flex items-center justify-center gap-2"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="w-7 h-7 text-green-500 animate-spin"/></div>}>
      <BookPageContent />
    </Suspense>
  );
}
