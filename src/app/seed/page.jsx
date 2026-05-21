'use client';

import { useState } from 'react';

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSeed = async () => {
    try {
      setLoading(true);
      setMessage('');

      const res = await fetch('/api/seed');
      const data = await res.json();

      if (data.success) {
        setMessage(data.message || 'Seed completed successfully!');
      } else {
        setMessage(data.error || 'Seed failed');
      }
    } catch (error) {
      setMessage('Something went wrong while seeding.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold mb-3">Seed LifeFundies Guides</h1>
        <p className="text-zinc-400 mb-6">
          Add demo guides to Firestore in one click.
        </p>

        <button
          onClick={handleSeed}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 transition font-semibold disabled:opacity-60"
        >
          {loading ? 'Seeding...' : 'Seed Guides'}
        </button>

        {message && (
          <div className="mt-5 p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-zinc-200">
            {message}
          </div>
        )}
      </div>
    </main>
  );
}