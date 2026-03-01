"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import SideMenu from "@/components/SideMenu";
import useAuth from "@/lib/useAuth";
import Image from "next/image";

export default function Hero() {
  const { user } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleExplore = () => {
    if (user) router.push("/book");
    else router.push("/login");
  };

  return (
    <>
      {/* 🔹 Google Profile Icon */}
      <button
        onClick={() => (user ? setMenuOpen(true) : router.push("/login"))}
        className="fixed top-5 right-5 z-[9999]
                   w-10 h-10 rounded-full
                   border border-white/40
                   overflow-hidden
                   bg-black/40 backdrop-blur
                   hover:scale-105 transition"
      >
        {user?.photoURL ? (
          <Image
            src={user.photoURL}
            alt="Profile"
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-sm">👤</span>
        )}
      </button>

      {/* MENU */}
      <SideMenu open={menuOpen} setOpen={setMenuOpen} />

      {/* HERO */}
      <section
        className="relative h-screen flex items-center justify-center text-white overflow-hidden"
        style={{
          backgroundImage: "url('/bg1.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* 🔹 Dark cinematic overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* 🔹 Center content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="relative z-10 text-center px-6"
        >
          <h1 className="text-4xl md:text-6xl font-semibold tracking-wide mb-6">
            Heal. Grow. Transform.
          </h1>

          <p className="opacity-80 max-w-xl mx-auto mb-10 text-sm md:text-base">
            Personalized life guidance sessions for clarity, confidence and
            direction.
          </p>

          <button
            onClick={handleExplore}
            className="px-10 py-4 border border-white/60
                       hover:bg-white hover:text-black
                       transition-all duration-300
                       tracking-widest text-sm"
          >
            EXPLORE
          </button>
        </motion.div>

        {/* 🔹 Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-b from-transparent to-[#0b0f1a]" />

        {/* 🔹 Scroll text */}
        <motion.p
          className="absolute right-6 bottom-29 rotate-90 tracking-[0.2em] text-xl opacity-70"
          animate={{ x: [0, 6, 0] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        >
          SCROLL DOWN →
        </motion.p>
      </section>
    </>
  );
}