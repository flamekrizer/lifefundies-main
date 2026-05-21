"use client";
import { useState } from "react";
import { signupUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    try {
      await signupUser(email, password);
      router.push("/guides");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url(/bg1.jpg)] bg-cover bg-center text-white">
      <div className="bg-white/5 p-10 rounded-xl w-90">

        <h2 className="text-2xl font-bold mb-6 text-center">
          Create Account
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 bg-black border"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-6 bg-black border"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleSignup}
          className="w-full bg-blue-500 py-3 rounded mb-4"
        >
          Create Account
        </button>

        <p
          onClick={() => router.push("/login")}
          className="text-sm text-center cursor-pointer text-blue-400"
        >
          Already have an account? Login
        </p>

      </div>
    </div>
  );
}