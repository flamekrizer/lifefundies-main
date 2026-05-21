"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { Calendar, Clock, Video, MessageCircle, ArrowRight, Wallet, User as UserIcon } from "lucide-react";

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
  const [upcomingSession, setUpcomingSession] = useState(null);

  // Fetch Firestore profile & upcoming sessions
  useEffect(() => {
    if (!user?.uid || !db) return;

    const fetchDashboardData = async () => {
      try {
        // 1. Fetch User Profile
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) setProfile(snap.data());

        // 2. Fetch Latest Upcoming/Confirmed Session
        const bookingsRef = collection(db, "bookings");
        const q = query(
          bookingsRef,
          where("userId", "==", user.uid),
          where("status", "in", ["paid", "confirmed", "upcoming", "active"]),
          orderBy("createdAt", "desc"),
          limit(1)
        );
        const bookingSnap = await getDocs(q);
        if (!bookingSnap.empty) {
          const bookingData = bookingSnap.docs[0].data();
          setUpcomingSession({
            id: bookingSnap.docs[0].id,
            ...bookingData
          });
        }
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const handleLogout = async () => {
    await logoutUser();
    router.push("/login");
  };

  if (loading || fetching) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-400 text-sm">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  const sessionTime = upcomingSession?.scheduledAt
    ? new Date(upcomingSession.scheduledAt).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : upcomingSession?.sessionDate
    ? `${upcomingSession.sessionDate} at ${upcomingSession.sessionTime || ""}`
    : null;

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#050505] text-white">

        {/* NAVBAR */}
        <header className="sticky top-0 z-40 bg-black/80 backdrop-blur border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <h1
              className="text-lg font-semibold cursor-pointer"
              onClick={() => router.push("/dashboard")}
            >
              LifeFundies
            </h1>
            <button
              onClick={() => setMenuOpen(true)}
              className="text-3xl hover:opacity-80 transition"
              aria-label="Open menu"
            >
              ☰
            </button>
          </div>
        </header>

        {/* SIDEMENU */}
        <SideMenu open={menuOpen} setOpen={setMenuOpen} />

        {/* HERO SECTION */}
        <section className="max-w-4xl mx-auto px-6 pt-12 pb-24">
          <div className="w-full bg-gradient-to-b from-white/10 to-white/5
                          backdrop-blur-xl rounded-[32px] p-8 md:p-10
                          border border-white/10 shadow-2xl">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-1">
                  Dashboard
                </h2>
                <p className="text-gray-400 text-sm">
                  Welcome back to LifeFundies 🌱
                </p>
              </div>
              
              {/* Optional LF-ID display */}
              {profile?.lfid && (
                <span className="bg-green-500/10 border border-green-500/25 px-4 py-1.5 rounded-full text-xs font-semibold text-green-400">
                  LFID: {profile.lfid}
                </span>
              )}
            </div>

            {/* STATS */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <Stat label="Sessions Booked" value={profile?.sessions ?? 0} icon={UserIcon} />
              <Stat label="Wallet Balance" value={`₹${profile?.wallet ?? 0}`} icon={Wallet} />
              <Stat label="Total Guides" value={12} icon={Calendar} />
            </div>

            {/* Anonymous warning */}
            {user?.isAnonymous && (
              <div className="mb-8 bg-blue-500/10 border border-blue-500/30
                              rounded-2xl p-4 text-sm text-blue-300">
                🔐 You’re browsing anonymously. Upgrade your account to secure and save your session history forever.
              </div>
            )}

            {/* ACTIVE/UPCOMING SESSION INTEGRATED COMPONENT */}
            {upcomingSession ? (
              <div className="mb-8 p-6 rounded-2xl bg-green-500/5 border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.05)]">
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-green-500/15 border border-green-500/20 text-[11px] font-semibold text-green-400 uppercase tracking-wide">
                      Next Confirmed Session
                    </span>
                    <h3 className="text-lg font-bold text-white mt-2">
                      Session with {upcomingSession.guideName || upcomingSession.guideId || "Your Guide"}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5 capitalize">
                      Topic: {upcomingSession.domain || "Life guidance"}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center font-bold text-white shrink-0 shadow-md">
                    {upcomingSession.guideName?.charAt(0) || "G"}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-zinc-300 mb-6 bg-white/[0.02] border border-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-green-400 shrink-0" />
                    <span>{sessionTime || "Scheduled"}</span>
                  </div>
                  <div className="hidden sm:block text-zinc-700">|</div>
                  <div className="flex items-center gap-2">
                    {upcomingSession.sessionType === "chat" ? (
                      <MessageCircle className="w-4 h-4 text-green-400 shrink-0" />
                    ) : (
                      <Video className="w-4 h-4 text-green-400 shrink-0" />
                    )}
                    <span className="capitalize">{upcomingSession.sessionType || "Video Call"} Session</span>
                  </div>
                </div>

                <button
                  onClick={() => router.push(upcomingSession.sessionId ? `/session/${upcomingSession.sessionId}` : "/sessions")}
                  className="w-full py-3.5 px-6 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold transition flex items-center justify-center gap-2 shadow-lg shadow-green-950/20 active:scale-98"
                >
                  Enter Guidance Room
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="mb-8 p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                <Calendar className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-white">No active or upcoming sessions found</h4>
                <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                  Book a specialized guidance session to connect with verified mentors.
                </p>
              </div>
            )}

            {/* ACTIONS */}
            <div className="flex flex-col gap-4">
              <button
                onClick={() => router.push("/book")}
                className="w-full py-4.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-2xl shadow-lg transition active:scale-98"
              >
                Book Guidance Session
              </button>

              <button
                onClick={() => router.push("/sessions")}
                className="w-full py-4 border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white font-medium rounded-2xl transition active:scale-98"
              >
                View Session History
              </button>

              {user?.isAnonymous && (
                <button
                  onClick={() => router.push("/upgrade")}
                  className="border border-blue-500 text-blue-400
                             py-4 rounded-2xl hover:bg-blue-500/10 transition active:scale-98"
                >
                  Upgrade Account
                </button>
              )}

              <button
                onClick={handleLogout}
                className="border border-white/20 py-4
                           rounded-2xl hover:bg-white/5 transition text-zinc-400 active:scale-98"
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

/* STAT CARD */
function Stat({ label, value, icon: Icon }) {
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-center flex flex-col items-center justify-center">
      <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400 mb-2 shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-[10px] text-gray-500 mb-0.5 uppercase tracking-wider font-semibold">{label}</p>
      <p className="font-bold text-lg text-white tabular-nums">{value}</p>
    </div>
  );
}