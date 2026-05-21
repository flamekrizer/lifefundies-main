'use client';

import { useEffect, useMemo, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { motion } from 'framer-motion';
import Search from 'lucide-react/dist/esm/icons/search';
import SlidersHorizontal from 'lucide-react/dist/esm/icons/sliders-horizontal';
import { db } from '@/lib/firebase';
import GuideCard from '@/components/GuideCard';

export default function GuidesPage() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('all');

  const domains = [
    { id: 'all', name: 'All Topics' },
    { id: 'career', name: 'Career' },
    { id: 'relationships', name: 'Relationships' },
    { id: 'mental-health', name: 'Mental Health' },
    { id: 'studies', name: 'Studies' },
    { id: 'finance', name: 'Finance' },
    { id: 'life-advice', name: 'Life Advice' },
  ];

  useEffect(() => {
    const loadGuides = async () => {
      try {
        setLoading(true);

        if (!db) {
          setGuides([]);
          return;
        }

        const q = query(collection(db, 'guides'), where('isActive', '==', true));
        const snapshot = await getDocs(q);

        const data = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .sort((a, b) => (b.rating || 0) - (a.rating || 0));

        setGuides(data);
      } catch (error) {
        console.error('Error loading guides:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGuides();
  }, []);

  const filteredGuides = useMemo(() => {
    return guides.filter((guide) => {
      const matchesDomain =
        selectedDomain === 'all' || guide.domainIds?.includes(selectedDomain);

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        guide.name?.toLowerCase().includes(q) ||
        guide.bio?.toLowerCase().includes(q) ||
        guide.domainIds?.some((d) => d.toLowerCase().includes(q));

      return matchesDomain && matchesSearch;
    });
  }, [guides, selectedDomain, searchQuery]);

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.12),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(34,197,94,0.08),_transparent_25%),linear-gradient(to_bottom,#050505,#050505)]" />

        <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-8 sm:px-6 lg:px-8 md:pb-10 md:pt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="max-w-3xl"
          >
            <span className="inline-flex rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-medium tracking-wide text-green-300">
              LifeFundies Guides
            </span>

            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
              Find the right guide for your situation
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
              Talk to real people who understand your current phase of life —
              privately, respectfully, and without judgment.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FILTER BAR */}
      <section className="sticky top-0 z-20 border-b border-white/5 bg-black/75 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="rounded-3xl border border-white/10 bg-white/[0.03] p-3 sm:p-4"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search guides, topics, support areas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-zinc-500 transition-all focus:border-green-500 focus:bg-white/[0.06]"
              />
            </div>

            <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400">
                <SlidersHorizontal className="h-4 w-4" />
              </div>

              {domains.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDomain(d.id)}
                  className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                    selectedDomain === d.id
                      ? 'bg-green-500 text-black shadow-[0_0_24px_rgba(34,197,94,0.18)]'
                      : 'border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10'
                  }`}
                >
                  {d.name}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* RESULTS */}
      <section className="mx-auto max-w-7xl px-4 pb-32 pt-8 sm:px-6 lg:px-8">
        {!db ? (
          <div className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-6 text-center">
            <h3 className="text-lg font-semibold text-amber-200">
              Firebase not connected
            </h3>
            <p className="mt-2 text-sm text-amber-100/80">
              Add your Firebase env variables and reload the app.
            </p>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-[320px] animate-pulse rounded-3xl border border-white/5 bg-white/[0.03]"
              />
            ))}
          </div>
        ) : filteredGuides.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
            <h3 className="text-xl font-semibold text-white">No guides found</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Try another topic or use a broader keyword.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-zinc-400">
                Showing{' '}
                <span className="font-semibold text-white">{filteredGuides.length}</span>{' '}
                guide{filteredGuides.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredGuides.map((guide, index) => (
                <motion.div
                  key={guide.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06, duration: 0.35 }}
                >
                  <GuideCard guide={guide} />
                </motion.div>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}