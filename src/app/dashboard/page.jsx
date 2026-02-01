"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import { logoutUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth(); // 👈 IMPORTANT

  const handleLogout = async () => {
    await logoutUser();
    router.push("/login");
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-black text-white flex items-center px-10">

        <div className="bg-white/5 p-10 rounded-2xl max-w-xl">
          <h1 className="text-3xl font-bold mb-6">
            User Dashboard
          </h1>

          <p className="mb-2">🆔 LF-ID: LF-357793</p>
          <p className="mb-2">📅 Sessions: 0</p>
          <p className="mb-6">💰 Wallet: ₹0</p>

          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => router.push("/book")}
              className="bg-blue-500 px-6 py-3 rounded"
            >
              Book Session
            </button>

            <button
              onClick={handleLogout}
              className="border px-6 py-3 rounded"
            >
              Logout
            </button>

            {/* 🔥 ONLY FOR ANONYMOUS USERS */}
            {user?.isAnonymous && (
              <button
                onClick={() => router.push("/upgrade")}
                className="border border-blue-500 text-blue-400 px-6 py-3 rounded"
              >
                Upgrade Account
              </button>
            )}
          </div>
        </div>

      </main>
    </ProtectedRoute>
  );
}