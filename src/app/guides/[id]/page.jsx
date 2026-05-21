'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import {
  Star,
  Languages,
  Shield,
  Clock3,
  ArrowLeft,
  BadgeCheck,
  MessageCircleHeart,
} from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/firebase';

export default function GuideDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGuide = async () => {
      try {
        setLoading(true);

        if (!db) {
          setGuide(null);
          return;
        }

        const ref = doc(db, 'guides', params.id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setGuide({
            id: snap.id,
            ...snap.data(),
          });
        } else {
          setGuide(null);
        }
      } catch (error) {
        console.error('Error loading guide:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) loadGuide();
  }, [params?.id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050505] px-4 py-10 text-white">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-zinc-400">
          Loading guide...
        </div>
      </main>
    );
  }

  if (!guide) {
    return (
      <main className="min-h-screen bg-[#050505] px-4 py-10 text-white">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-zinc-400">
          {!db
            ? 'Firebase config missing. Please set NEXT_PUBLIC_FIREBASE_* env vars.'
            : 'Guide not found.'}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-6xl px-4 pb-32 pt-4">

        {/* BACK */}
        <Link
          href="/guides"
          className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-400 active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        {/* HEADER */}
        <section className="rounded-[28px] border border-white/10 bg-gradient-to-br from-green-500/10 via-white/[0.03] to-emerald-500/5 p-4 shadow-xl backdrop-blur-xl">

          <div className="flex flex-col gap-5">

            {/* PROFILE */}
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-700 text-xl font-bold">
                {guide.name?.charAt(0) || 'G'}
              </div>

              <div>
                <h1 className="text-lg font-semibold leading-tight">
                  {guide.name}
                </h1>

                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="chip-yellow">
                    <Star className="h-3 w-3 fill-yellow-300" />
                    {guide.rating || '4.8'}
                  </span>

                  <span className="chip">
                    <Languages className="h-3 w-3 text-green-400" />
                    {guide.languages?.join(', ') || 'English, Hindi'}
                  </span>

                  <span className="chip-green">
                    <BadgeCheck className="h-3 w-3" />
                    Verified
                  </span>
                </div>
              </div>
            </div>

            {/* BIO */}
            <p className="text-sm text-zinc-300">
              {guide.bio ||
                'Supportive guide helping you gain clarity, confidence and direction.'}
            </p>

            {/* PRICE + CTA */}
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 p-4">
              <div>
                <p className="text-xs text-zinc-400">Session Fee</p>
                <p className="text-2xl font-bold text-green-400">
                  ₹{guide.price || 399}
                </p>
              </div>

              <button
                onClick={() => router.push('/book?guide=' + guide.id)}
                className="rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-black active:scale-95"
              >
                Book
              </button>
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <div className="mt-5 space-y-5">

          {/* TOPICS */}
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <h2 className="text-sm text-zinc-400">Topics Covered</h2>

            <div className="mt-3 flex flex-wrap gap-2">
              {guide.domainIds?.map((d, i) => (
                <span key={i} className="chip">
                  {d.replaceAll('-', ' ')}
                </span>
              ))}
            </div>
          </section>

          {/* TRUST */}
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <h2 className="text-sm text-zinc-400">Why LifeFundies?</h2>

            <div className="mt-4 space-y-3 text-sm text-zinc-300">
              <div className="flex gap-2">
                <Shield className="h-4 w-4 text-green-400" />
                Private & safe experience
              </div>

              <div className="flex gap-2">
                <Clock3 className="h-4 w-4 text-green-400" />
                Choose your time
              </div>

              <div className="flex gap-2">
                <MessageCircleHeart className="h-4 w-4 text-green-400" />
                WhatsApp booking
              </div>
            </div>
          </section>

        </div>

        {/* STICKY CTA (PWA FEEL) */}
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/80 p-3 backdrop-blur-xl">
          <button
            onClick={() => router.push('/book?guide=' + guide.id)}
            className="w-full rounded-2xl bg-green-500 py-3 text-base font-semibold text-black active:scale-[0.98]"
          >
            Book Session with {guide.name?.split(' ')[0]}
          </button>
        </div>
      </div>
    </main>
  );
}