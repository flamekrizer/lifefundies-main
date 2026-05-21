'use client';

import Link from 'next/link';
import { Star, ShieldCheck, Languages } from 'lucide-react';

export default function GuideProfileHeader({ guide }) {
  if (!guide) return null;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-linear-to-br from-green-500 to-emerald-700 text-3xl font-bold text-white shadow-xl">
            {guide.name?.charAt(0) || 'G'}
          </div>

          <div>
            <h1 className="text-3xl font-bold text-white">{guide.name}</h1>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-300">
              <span className="inline-flex items-center gap-1 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-yellow-300">
                <Star className="w-4 h-4 fill-yellow-300" />
                {guide.rating || '4.8'}
              </span>

              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                <Languages className="w-4 h-4 text-green-400" />
                {guide.languages?.join(', ') || 'English, Hindi'}
              </span>

              <span className="inline-flex items-center gap-1 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-green-300">
                <ShieldCheck className="w-4 h-4" />
                Verified Guide
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end">
          <p className="text-sm text-gray-400">Session Fee</p>
          <p className="text-3xl font-bold text-green-400">₹{guide.price || 399}</p>

          <Link
            href={`/guides/${guide.id}`}
            className="mt-4 inline-flex items-center justify-center rounded-2xl bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-green-700"
          >
            Book This Guide
          </Link>
        </div>
      </div>
    </div>
  );
}