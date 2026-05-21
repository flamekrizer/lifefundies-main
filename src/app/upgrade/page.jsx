"use client";
import { useState } from "react";
import { upgradeWithEmail, upgradeWithGoogle } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function UpgradePage() {
  const router = useRouter();
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const handleEmailUpgrade = async () => {
    try {
      await upgradeWithEmail(email, password);
      alert("Account upgraded 🎉");
      router.push("/dashboard");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleGoogleUpgrade = async () => {
    try {
      await upgradeWithGoogle();
      alert("Account upgraded 🎉");
      router.push("/dashboard");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-white/5 p-10 rounded-xl w-90">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Upgrade Account
        </h2>

        <input
          placeholder="Email"
          className="w-full p-3 mb-4 bg-black border"
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          placeholder="Password"
          type="password"
          className="w-full p-3 mb-6 bg-black border"
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button
          onClick={handleEmailUpgrade}
          className="w-full bg-blue-500 py-3 rounded mb-4"
        >
          Upgrade with Email
        </button>

        <button
          onClick={handleGoogleUpgrade}
          className="w-full border py-3"
        >
          Upgrade with Google
        </button>
      </div>
    </div>
  );
}