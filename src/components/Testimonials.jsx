"use client";
import { motion } from "framer-motion";

const reviews = [
  {
    name: "Anonymous User",
    role: "Career Guidance",
    text: "LifeFundies helped me find clarity when I was completely confused about my future."
  },
  {
    name: "Anonymous User",
    role: "Emotional Support",
    text: "I felt heard for the first time. The guide was understanding and non-judgmental."
  },
  {
    name: "Anonymous User",
    role: "Relationship Help",
    text: "This platform saved my relationship. Forever grateful."
  },
  {
    name: "Anonymous User",
    role: "Personal Growth",
    text: "Best decision I ever made. Highly recommend."
  },
  {
    name: "Anonymous User",
    role: "Mental Health",
    text: "Safe space where I could open up freely."
  },
  {
    name: "Anonymous User",
    role: "Career Switch",
    text: "Guidance was practical & realistic."
  },
  {
    name: "Anonymous User",
    role: "Self Improvement",
    text: "Helped me build confidence again."
  },
  {
    name: "Anonymous User",
    role: "Stress Management",
    text: "Now I know how to handle pressure."
  }
];

export default function Testimonials() {
  return (
    <section className="bg-black text-white py-32">

      {/* Heading */}
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="text-4xl md:text-6xl 
        font-bold text-center mb-6"
      >
        What People Say About
        <span className="text-blue-500"> LifeFundies</span>
      </motion.h2>

      <p className="text-gray-400 text-center mb-20">
        75+ successful sessions completed
      </p>

      {/* Cards */}
      <div className="max-w-7xl mx-auto 
      grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 
      gap-10 px-6">

        {reviews.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.04 }}
            className="bg-white/5 
            backdrop-blur-xl
            border border-white/10
            rounded-2xl
            p-8
            hover:border-blue-500
            hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]
            transition"
          >
            <p className="text-gray-300 mb-6 leading-relaxed">
              “{item.text}”
            </p>

            <div>
              <h4 className="font-semibold">
                {item.name}
              </h4>
              <p className="text-sm text-blue-400">
                {item.role}
              </p>
            </div>
          </motion.div>
        ))}

      </div>
    </section>
  );
}