'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Star from 'lucide-react/dist/esm/icons/star';
import Languages from 'lucide-react/dist/esm/icons/languages';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';

export default function GuideCard({ guide }) {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      className="group flex h-full flex-col rounded-[28px] border border-white/10 bg-white/[0.045] p-4 sm:p-5 shadow-[0_10px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl transition duration-300 hover:border-green-500/30 hover:bg-white/[0.06]"
    >
      {/* TOP */}
      <div className="flex items-start justify-between gap-3">
        {/* Left */}
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {/* Avatar */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-700 text-base sm:h-14 sm:w-14 sm:text-lg font-bold text-white shadow-lg">
            {guide.name?.charAt(0) || 'G'}
          </div>

          {/* Name + Bio */}
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold text-white sm:text-lg">
              {guide.name}
            </h3>

            <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-400 sm:text-sm">
              {guide.bio || 'Supportive and relatable guide for your growth journey.'}
            </p>
          </div>
        </div>

        {/* Rating */}
        <div className="shrink-0 inline-flex items-center gap-1 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-2.5 py-1 text-[11px] sm:text-xs text-yellow-300">
          <Star className="h-3.5 w-3.5 fill-yellow-300" />
          {guide.rating || '4.8'}
        </div>
      </div>

      {/* TAGS */}
      <div className="mt-4 flex flex-wrap gap-2">
        {guide.domainIds?.slice(0, 2).map((domain, idx) => (
          <span
            key={idx}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-zinc-200 capitalize sm:text-xs"
          >
            {domain.replaceAll('-', ' ')}
          </span>
        ))}
      </div>

      {/* META */}
      <div className="mt-4 space-y-2.5 text-xs text-zinc-300 sm:text-sm">
        <div className="flex items-center gap-2">
          <Languages className="h-4 w-4 shrink-0 text-green-400" />
          <span className="truncate">
            {guide.languages?.join(', ') || 'English, Hindi'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 shrink-0 text-green-400" />
          <span>Private & anonymous support</span>
        </div>
      </div>

      {/* Divider */}
      <div className="mt-5 h-px w-full bg-white/8" />

      {/* BOTTOM */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Price */}
        <div>
          <p className="text-[11px] text-zinc-500">Starting from</p>
          <p className="text-2xl font-bold text-green-400 sm:text-3xl">
            ₹{guide.price || 399}
          </p>
        </div>

        {/* CTA */}
        <Link
          href={`/guides/${guide.id}`}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-green-900/20 transition-all duration-200 hover:bg-green-700 active:scale-[0.98] sm:w-auto sm:min-w-[150px]"
        >
          View & Book
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </motion.div>
  );
}