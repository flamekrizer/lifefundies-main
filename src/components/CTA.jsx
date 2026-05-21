"use client";
import { motion } from "framer-motion";

export default function CTA() {
  return (
    <section className="bg-black text-white py-32">

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto 
        bg-white/5 backdrop-blur-xl
        border border-white/10
        rounded-3xl
        p-14 text-center
        hover:border-blue-500
        hover:shadow-[0_0_40px_rgba(59,130,246,0.4)]
        transition"
      >

        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Ready to Transform Your Life?
        </h2>

        <p className="text-gray-400 mb-10 text-lg">
          Join 75+ successful sessions and take your first step
          towards clarity, confidence & growth.
        </p>

        <div className="flex flex-col md:flex-row 
        justify-center gap-6">

          <button
            className="bg-blue-500 text-black 
            px-10 py-4 rounded-xl 
            font-semibold
            hover:bg-blue-600 transition"
          >
            Book a Session
          </button>

          <button
            className="border border-white 
            px-10 py-4 rounded-xl
            hover:bg-white hover:text-black 
            transition"
          >
            Get Free Guidance
          </button>

        </div>

      </motion.div>
    </section>
  );
}