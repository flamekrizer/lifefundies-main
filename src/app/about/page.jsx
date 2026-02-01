"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Footer from "@/components/Footer";
import { useState } from "react";
import SideMenu from "@/components/SideMenu";


export default function AboutPage() {
   const [menuOpen, setMenuOpen] = useState(false);
  return (
    <main className="bg-black text-white overflow-hidden">
      {/* hamburger  */}
      <button
        onClick={() => setMenuOpen(true)}
        className="fixed top-6 right-6 z-[9999] 
        text-white text-3xl"
      >
        ☰
      </button>
      <SideMenu open={menuOpen} setOpen={setMenuOpen} />  

      {/* ================= HERO ================= */}
      <section className="relative h-[80vh] flex items-center justify-center text-center px-6">
        <Image
          src="/bg5.jpg"
          alt="LifeFundies Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/70" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 max-w-4xl"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Our Approach to <span className="text-blue-500">Life Guidance</span>
          </h1>
          <p className="text-lg text-gray-300">
            We don’t preach. We don’t judge.  
            We walk with you — through confusion, overthinking, and self-doubt.
          </p>
        </motion.div>
      </section>

      {/* ================= APPROACH ================= */}
      <section className="max-w-7xl mx-auto py-24 px-6 grid md:grid-cols-4 gap-8">
        {[
          {
            title: "Clarity Check-ins",
            desc: "We start by understanding what’s really happening — emotionally & mentally."
          },
          {
            title: "Tailored Frameworks",
            desc: "No generic advice. Every path is designed for your situation."
          },
          {
            title: "Mindset Tools",
            desc: "Practical tools for emotional strength & better thinking."
          },
          {
            title: "Progress Logs",
            desc: "Growth you can track — intentional, measurable, real."
          }
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
            className="bg-white/5 p-8 rounded-2xl 
            border border-white/10 backdrop-blur-xl"
          >
            <h3 className="text-xl font-semibold mb-3 text-blue-400">
              {item.title}
            </h3>
            <p className="text-gray-300 text-sm">
              {item.desc}
            </p>
          </motion.div>
        ))}
      </section>

      {/* ================= STORY ================= */}
      <section className="py-24 bg-[#0b0f1a]">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">
              From Confusion to Clarity
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Schools teach equations, not emotions.  
              Careers teach survival, not self-understanding.
              <br /><br />
              LifeFundies was born from listening — to students,
              professionals, and people silently struggling.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Image
              src="/logo.jpeg"
              alt="LifeFundies Journey"
              width={600}
              height={400}
              className="rounded-2xl opacity-90"
            />
          </motion.div>

        </div>
      </section>

      {/* ================= TIMELINE ================= */}
      <section className="py-24 bg-black">
        <h2 className="text-4xl font-bold text-center mb-20">
          Our <span className="text-blue-500">Journey</span>
        </h2>

        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-4 gap-8 relative">

          {/* connector */}
          <div className="hidden md:block absolute top-10 left-0 right-0 h-[2px] bg-blue-500/30" />

          {[
            {
              year: "2023",
              title: "Idea Conceived",
              desc: "100+ real youth conversations"
            },
            {
              year: "2024",
              title: "Mini MVPs",
              desc: "Market validation through guidance"
            },
            {
              year: "2025",
              title: "Beta Launch",
              desc: "Real users, real impact"
            },
            {
              year: "Next",
              title: "Scale Up",
              desc: "Colleges & peer circles"
            }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/5 border border-white/10 
              rounded-2xl p-8 backdrop-blur-xl"
            >
              <div className="w-3 h-3 bg-blue-500 rounded-full mb-4" />
              <p className="text-blue-400 font-bold">{item.year}</p>
              <h3 className="text-xl font-semibold mt-2 mb-2">
                {item.title}
              </h3>
              <p className="text-gray-300 text-sm">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= FOUNDER ================= */}
      <section className="py-24 bg-[#0b0f1a]">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">
              I’m Asmit Sharma
            </h2>
            <p className="text-blue-400 mb-6">
              The mind behind LifeFundies
            </p>

            <p className="text-gray-300 leading-relaxed">
              I’m not a therapist or guru.  
              Just someone who’s been through confusion,
              reflected deeply, and chose to build something
              India desperately needs.
            </p>

            <blockquote className="mt-6 border-l-4 border-blue-500 pl-4 italic text-gray-400">
              “You don’t need therapy bills to feel better.
              You need someone real to talk to.”
            </blockquote>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Image
              src="/founder.jpeg"
              alt="Founder"
              width={450}
              height={520}
              className="rounded-2xl shadow-xl"
            />
          </motion.div>

        </div>
      </section>

      {/* ================= VALUES ================= */}
      <section className="py-24 text-center bg-black">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-6"
        >
          What We Believe In
        </motion.h2>

        <p className="text-gray-400">
          Anonymity • Authenticity • Affordability • Always Human
        </p>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-24 bg-black text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-8"
        >
          LifeFundies is for you.
        </motion.h2>

        <button className="bg-blue-500 px-10 py-4 rounded-lg text-lg hover:bg-blue-600 transition">
          Start Your Journey
        </button>
      </section>

      <Footer />
    </main>
  );
}