'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  ShieldCheck,
  MessageCircle,
  Sparkles,
  Hash,
  Clock,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { openWhatsAppBooking } from '@/lib/bookingUtils';
import useAuth from '@/lib/useAuth';

const domainOptions = [
  'career',
  'relationships',
  'mental-health',
  'studies',
  'finance',
  'life-advice',
  'confidence',
  'motivation',
  'stress',
  'decision-making',
];

export default function BookingDrawer({ guide, open, onClose }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [concern, setConcern] = useState('');

  const canContinue = useMemo(() => {
    return selectedDomain && selectedDate && selectedTime;
  }, [selectedDomain, selectedDate, selectedTime]);

  const handleBook = () => {
    if (loading) return;

    if (!user) {
      router.push(`/login?redirect=/guides/${guide.id}`);
      return;
    }

    openWhatsAppBooking({
      guide,
      user,
      selectedDomain,
      selectedDate,
      selectedTime,
      concern,
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute inset-x-0 bottom-0 mx-auto max-w-2xl rounded-t-[32px] border border-white/10 bg-[#0B0B0D] p-5 shadow-2xl md:bottom-6 md:left-1/2 md:-translate-x-1/2 md:rounded-[32px]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-green-400">Book with confidence</p>
                <h3 className="text-2xl font-bold text-white">{guide?.name}</h3>
              </div>

              <button
                onClick={onClose}
                className="rounded-full border border-white/10 p-2 text-gray-300 hover:bg-white/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Grid */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Left Card */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-3 flex items-center gap-2 text-white">
                  <ShieldCheck className="h-5 w-5 text-green-400" />
                  <span className="font-medium">Private & anonymous</span>
                </div>

                <p className="text-sm text-gray-300">
                  Your booking is handled privately. No personal contact is shown to guides.
                </p>

                <div className="mt-5">
                  <p className="text-xs uppercase tracking-wide text-gray-400">Session Fee</p>
                  <p className="mt-1 text-3xl font-bold text-green-400">
                    ₹{guide?.price || 399}
                  </p>
                </div>

                <div className="mt-5 rounded-2xl border border-green-500/20 bg-green-500/10 p-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-green-300">
                    <Sparkles className="h-4 w-4" />
                    Human-first support
                  </div>
                  <p className="mt-1 text-xs leading-5 text-green-100/80">
                    A real LifeFundies team member will coordinate your booking and payment manually.
                  </p>
                </div>
              </div>

              {/* Right Form */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                {/* Topic */}
                <label className="mb-2 block text-sm font-medium text-white">
                  Select Topic
                </label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <select
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 pl-11 text-white outline-none focus:border-green-500"
                  >
                    <option value="">Choose a topic</option>
                    {domainOptions.map((d) => (
                      <option key={d} value={d}>
                        {d.replaceAll('-', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <label className="mb-2 mt-4 block text-sm font-medium text-white">
                  Preferred Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 pl-11 text-white outline-none focus:border-green-500"
                  />
                </div>

                {/* Time */}
                <label className="mb-2 mt-4 block text-sm font-medium text-white">
                  Preferred Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 pl-11 text-white outline-none focus:border-green-500"
                  />
                </div>

                {/* Concern */}
                <label className="mb-2 mt-4 block text-sm font-medium text-white">
                  Your Concern (Optional)
                </label>
                <div className="relative">
                  <MessageCircle className="absolute left-4 top-4 h-4 w-4 text-zinc-500" />
                  <textarea
                    value={concern}
                    onChange={(e) => setConcern(e.target.value)}
                    rows={4}
                    placeholder="Write a little about what you want help with..."
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 pl-11 text-white outline-none placeholder:text-gray-500 focus:border-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Process */}
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-gray-300">
              <div className="mb-2 flex items-center gap-2 text-white">
                <Calendar className="h-4 w-4 text-green-400" />
                Booking Process
              </div>
              <p className="leading-6">
                Choose your topic, date and time → login (if needed) → WhatsApp booking →
                payment confirmation by LifeFundies.
              </p>
            </div>

            {/* CTA */}
            <button
              onClick={handleBook}
              disabled={!canContinue}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 px-5 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <MessageCircle className="h-5 w-5" />
              Continue to Booking
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}