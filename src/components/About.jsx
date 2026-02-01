"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

export default function About() {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Background blur animation
  const blur = useTransform(
    scrollYProgress,
    [0, 0.35],
    ["blur(28px)", "blur(0px)"]
  );

  // Subtle glow
  const glow = useTransform(
    scrollYProgress,
    [0, 0.35],
    [
      "drop-shadow(0 0 0px rgba(59,130,246,0))",
      "drop-shadow(0 0 35px rgba(59,130,246,0.35))",
    ]
  );

  return (
    <section
      ref={ref}
      className="relative bg-amber-50 text-black py-32 overflow-hidden"
    >
      {/* BACKGROUND LOGO */}
      <motion.div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          style={{ filter: blur }}
          className="relative w-[700px] h-[700px] opacity-[0.08]"
        >
          <Image
            src="/logo.jpeg"
            alt="LifeFundies Logo"
            fill
            className="object-contain"
            priority
          />
        </motion.div>
      </motion.div>

      {/* GLOW OVERLAY */}
      <motion.div
        style={{ filter: glow }}
        className="absolute inset-0 pointer-events-none"
      />

      {/* CONTENT */}
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <h2 className="text-5xl md:text-6xl text-center font-bold mb-10">
          What is <span className="text-blue-500">LifeFundies</span>?
        </h2>

        <p className="text-lg md:text-xl leading-relaxed text-center max-w-4xl mx-auto">
          LifeFundies is India’s first{" "}
          <b>anonymous life-guidance platform</b> designed to support people
          across <b>18 life domains</b>.
          <br />
          <br />
          From career confusion to emotional struggles, from self-growth to
          relationships — we connect you with the right mentors and guides in a
          completely safe, private & judgment-free space.
          <br />
          <br />
          Our mission is simple:
          <span className="text-blue-500 font-semibold">
            {" "}
            Redesigning Life Fundamentals.
          </span>
        </p>
      </div>
    </section>

       
      
  );
}