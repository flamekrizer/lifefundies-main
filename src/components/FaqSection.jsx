"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";

const faqs = [
  {
    q: "What is LifeFundies?",
    a: "LifeFundies is India’s first Life-Readiness Platform — a safe space where you can get guidance for anything that bothers you: relationships, career confusion, mental well-being, or just life in general. It's not therapy, not edtech — it's a holistic guidance buddy."
  },
  {
    q: "How is LifeFundies different from therapy or counselling platforms?",
    a: "We’re not just about mental health. LifeFundies offers peer-based guidance, mentorship from seniors, anonymous safe spaces, and real-life problem solving — not just psychological diagnosis. Think of it like talking to someone who gets it, with the wisdom to help."
  },
  {
    q: "Is this platform anonymous?",
    a: "Yes. You can choose to stay anonymous during sessions. We respect privacy and never judge. Your problems are safe with us."
  },
  {
    q: "Who are the people guiding me?",
    a: `Our guides include:
• Trained peer mentors
• Senior citizens with life experience
• LifeFundies-trained professionals

Each guide is handpicked and trained under our internal process. No random volunteers — only people with empathy, experience, and clarity.`
  },
  {
    q: "I’m in school/college. Can I also book a session?",
    a: "Absolutely! In fact, school and college students are our biggest user base. From academic pressure to relationship drama, we’ve got your back."
  },
  {
    q: "Is there a free session?",
    a: "Yes! Your first session (20 min) is absolutely free. It helps you understand how we work and if LifeFundies is the right space for you."
  }
];

export default function FaqSection() {
  const [open, setOpen] = useState(0);

  return (
    <section className=" text-white py-24">
      {/* HEADING */}
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl md:text-6xl
            font-bold text-center mb-6"
      >
        Frequently Asked <span className="text-blue-500">Questions</span>
      </motion.h2>

      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10">

        {/* LEFT */}
        <div className="md:col-span-2 space-y-5">

          {faqs.map((item, i) => (
            <div
              key={i}
              className={`rounded-xl overflow-hidden border 
              ${open === i ? "border-blue-500" : "border-white/10"}`}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className={`w-full flex justify-between items-center 
                px-6 py-5 text-left font-medium text-lg
                ${open === i ? "bg-blue-600" : "bg-white/5"}`}
              >
                {item.q}
                {open === i ? <ChevronUp /> : <ChevronDown />}
              </button>

              {open === i && (
                <div className="bg-white text-black px-6 py-5 text-sm leading-relaxed whitespace-pre-line">
                  {item.a}
                </div>
              )}
            </div>
          ))}

        </div>

        {/* RIGHT CARD */}
        <div className="hidden md:block">
          <div
            className="rounded-2xl overflow-hidden bg-cover bg-center h-full"
            style={{ backgroundImage: "url('/team.jpeg')" }}
          >
            <div className="bg-black/60 h-full p-6 flex flex-col justify-end">
              <h3 className="text-xl font-semibold mb-3">
                Join the LifeFundies Community
              </h3>

              <p className="text-sm text-gray-300 mb-4">
                Real guidance. Real people. Real change.
              </p>

              <button className="bg-blue-600 px-6 py-3 rounded-lg w-fit">
                DISCOVER MORE
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}