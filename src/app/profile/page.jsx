"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthContext } from "@/app/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { logoutUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, loading } = useAuthContext();
  const [profile, setProfile] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!user?.uid) return;

    const fetchProfile = async () => {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) setProfile(snap.data());
    };

    fetchProfile();
  }, [user]);

  const handleLogout = async () => {
    await logoutUser();
    router.push("/login");
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-black text-white">

        {/* TOP BAR */}
        <header className="sticky top-0 z-40 bg-black/80 backdrop-blur border-b border-white/10">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-gray-400 hover:text-white transition"
            >
              ← Dashboard
            </button>

            <button
              onClick={handleLogout}
              className="text-sm px-4 py-1.5 rounded-md 
                         border border-red-500/40 
                         text-red-400 hover:bg-red-500/10 transition"
            >
              Logout
            </button>
          </div>
        </header>

        {/* PROFILE CARD */}
        <section className="flex justify-center px-6 py-20">
          <div className="w-full max-w-md 
                          bg-linear-to-b from-white/10 to-white/5 
                          backdrop-blur-xl 
                          rounded-3xl 
                          p-10 
                          shadow-2xl 
                          border border-white/10">

            {/* TITLE */}
            <h1 className="text-3xl font-bold text-center">
              My Profile
            </h1>
            <p className="text-center text-gray-400 text-sm mt-1 mb-10">
              Your LifeFundies identity
            </p>

            {/* AVATAR */}
            <div className="flex justify-center mb-8">
              {user.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt="Profile"
                  width={120}
                  height={120}
                  className="rounded-full 
                             object-cover 
                             ring-4 ring-blue-500/30 
                             shadow-lg"
                />
              ) : (
                <div className="w-28 h-28 rounded-full 
                                bg-blue-600 
                                flex items-center justify-center 
                                text-3xl font-bold 
                                ring-4 ring-blue-500/30">
                  {user.displayName?.[0] || "U"}
                </div>
              )}
            </div>

            {/* EDIT BUTTON */}
            <div className="text-center mb-10">
              <button
                onClick={() => alert("Edit profile coming soon 🚀")}
                className="px-6 py-2 
                           bg-blue-500 
                           rounded-lg 
                           hover:bg-blue-600 
                           active:scale-95 
                           transition 
                           text-sm font-medium"
              >
                Edit Profile
              </button>
            </div>

            {/* INFO LIST */}
            <div className="space-y-5 text-sm">
              <Info label="Name">
                {user.displayName || "Anonymous User"}
              </Info>

              <Info label="Email">
                {user.email || "Not linked"}
              </Info>

              <Info label="Account">
                <span
                  className={`px-2 py-1 rounded-md text-xs font-medium ${
                    user.isAnonymous
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-green-500/20 text-green-400"
                  }`}
                >
                  {user.isAnonymous ? "Anonymous" : "Verified"}
                </span>
              </Info>

              <Info label="LF-ID">
                {profile?.lfid || "Loading..."}
              </Info>

              <Info label="Sessions">
                {profile?.sessions ?? 0}
              </Info>

              <Info label="Wallet">
                ₹{profile?.wallet ?? 0}
              </Info>
            </div>

          </div>
        </section>
      </main>
    </ProtectedRoute>
  );
}

/* INFO ROW */
function Info({ label, children }) {
  return (
    <div className="flex items-center justify-between 
                    border-b border-white/10 pb-2">
      <span className="text-gray-400">{label}</span>
      <span className="text-white font-medium">{children}</span>
    </div>
  );
}