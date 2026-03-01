"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { logoutUser } from "@/lib/auth";
import useAuth from "@/lib/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import SideMenu from "@/components/SideMenu";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [fetching, setFetching] = useState(true);

  // 🔹 Fetch Firestore profile
  useEffect(() => {
    if (!user?.uid) return;

    const fetchProfile = async () => {
      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) setProfile(snap.data());
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleLogout = async () => {
    await logoutUser();
    router.push("/login");
  };

  if (loading || fetching) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading dashboard...
      </main>
    );
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-black text-white">

        {/* 🔹 NAVBAR */}
        <header className="sticky top-0 z-40 bg-black/80 backdrop-blur border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

            <h1
              className="text-lg font-semibold cursor-pointer"
              onClick={() => router.push("/dashboard")}
            >
              LifeFundies
            </h1>

            {/* Hamburger (NOT fixed ❌) */}
            <button
              onClick={() => setMenuOpen(true)}
              className="text-3xl hover:opacity-80 transition"
              aria-label="Open menu"
            >
              ☰
            </button>

          </div>
        </header>

        {/* 🔹 SIDEMENU (outside header ✅) */}
        <SideMenu open={menuOpen} setOpen={setMenuOpen} />

        {/* 🔹 DASHBOARD CARD */}
        <section className="flex justify-center px-6 py-20">
          <div className="w-full max-w-xl bg-gradient-to-b from-white/10 to-white/5
                          backdrop-blur-xl rounded-3xl p-10
                          border border-white/10 shadow-2xl">

            <h2 className="text-3xl font-bold mb-1">
              Dashboard
            </h2>
            <p className="text-gray-400 text-sm mb-10">
              Welcome to LifeFundies 🌱
            </p>

            {/* STATS */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <Stat label="LF-ID" value={profile?.lfid} />
              <Stat label="Sessions" value={profile?.sessions ?? 0} />
              <Stat label="Wallet" value={`₹${profile?.wallet ?? 0}`} />
            </div>

            {/* Anonymous warning */}
            {user?.isAnonymous && (
              <div className="mb-8 bg-blue-500/10 border border-blue-500/30
                              rounded-xl p-4 text-sm text-blue-300">
                🔐 You’re browsing anonymously. Upgrade to save history.
              </div>
            )}

            {/* ACTIONS */}
            <div className="flex flex-col gap-4">
              <button
                onClick={() => router.push("/book")}
                className="bg-blue-500 hover:bg-blue-600 px-6 py-3
                           rounded-xl font-medium transition"
              >
                Book Session
              </button>

              {user?.isAnonymous && (
                <button
                  onClick={() => router.push("/upgrade")}
                  className="border border-blue-500 text-blue-400
                             px-6 py-3 rounded-xl hover:bg-blue-500/10 transition"
                >
                  Upgrade Account
                </button>
              )}

              <button
                onClick={handleLogout}
                className="border border-white/20 px-6 py-3
                           rounded-xl hover:bg-white/5 transition"
              >
                Logout
              </button>
            </div>

          </div>
        </section>

      </main>
    </ProtectedRoute>
  );
}

/* 🔹 STAT CARD */
function Stat({ label, value }) {
  return (
    <div className="bg-white/5 rounded-xl p-4 text-center">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="font-semibold text-lg">{value}</p>
    </div>
  );
}