"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      router.push("/");
    }, 1500);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <h2 className="text-xl">You’ve been logged out 👋</h2>
    </div>
  );
}