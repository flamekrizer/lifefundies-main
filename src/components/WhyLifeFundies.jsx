"use client";
import { motion } from "framer-motion";

const reasons = [
  {
    title: "100% Anonymous",
    desc: "No real identity required. Feel safe, open & judgement-free."
  },
  {
    title: "Real Human Guides",
    desc: "No bots. Only trained mentors who truly understand you."
  },
  {
    title: "18 Life Domains",
    desc: "From career to relationships, we cover every life area."
  },
  {
    title: "AI + Human Matching",
    desc: "Smart system connects you with the perfect guide."
  },
  {
    title: "Proven Impact",
    desc: "75+ successful sessions & growing community."
  },
  {
    title: "24/7 Support",
    desc: "Whenever you need help, we’re always here."
  }
];

export default function WhyLifeFundies() {
  return (
    <section className="bg-[#f9fafb] text-black py-32"> 
    {/* soft white */}

      {/* HEADING */}
      <motion.h2
        initial={{opacity:0, y:30}}
        whileInView={{opacity:1, y:0}}
        transition={{duration:0.6}}
        className="text-4xl md:text-6xl font-bold text-center mb-6"
      >
        Why <span className="text-blue-500">LifeFundies</span>?
      </motion.h2>

      <p className="text-black/60 text-center mb-20 max-w-2xl mx-auto">
        Because your life deserves clarity, guidance & emotional safety.
      </p>

      {/* CARDS */}
      <div className="max-w-7xl mx-auto grid 
      grid-cols-1 md:grid-cols-2 lg:grid-cols-3 
      gap-10 px-6">

        {reasons.map((item,i)=>(
          <motion.div
            key={i}
            initial={{opacity:0, y:20}}
            whileInView={{opacity:1, y:0}}
            transition={{delay:i*0.1}}
            whileHover={{scale:1.05}}
            className="bg-white 
            border border-black/20   /* DEFAULT BLACK */
            rounded-2xl
            p-10
            hover:border-blue-500
            hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]
            transition"
          >
            <h3 className="text-xl font-semibold mb-3">
              {item.title}
            </h3>

            <p className="text-gray-600 leading-relaxed">
              {item.desc}
            </p>
          </motion.div>
        ))}

      </div>
    </section>
  );
}