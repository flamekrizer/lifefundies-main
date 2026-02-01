"use client";
import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    title: "Anonymous Login",
    desc: "No real identity. Feel safe & free."
  },
  {
    num: "02",
    title: "Choose Life Domain",
    desc: "Pick your problem area."
  },
  {
    num: "03",
    title: "Smart Guide Match",
    desc: "AI + human routing."
  },
  {
    num: "04",
    title: "Heal & Grow",
    desc: "Real guidance starts."
  }
];

export default function HowItWorks() {
  return (
    <section className="relative py-32 bg-black text-white">

      <div className="max-w-7xl mx-auto px-6">

        {/* heading */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className=" text-4xl md:text-6xl 
          font-bold text-center mb-20"
        >
          How <span className="text-blue-500 ">
            LifeFundies</span> Works
        </motion.h2>

        {/* progress line */}
        <div className="relative mt-10 " >

          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "100%" }}
            transition={{ duration: 1 }}
            className="absolute top-1/2 
            left-0 h-[2px] 
            bg-gradient-to-r 
            from-blue-500 
            to-purple-500"
          />

          {/* cards */}
          <div className="relative grid 
          grid-cols-1 md:grid-cols-4 
          gap-10">

            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="backdrop-blur-xl 
                bg-white/5 
                border border-white/10 
                rounded-3xl 
                p-8 shadow-xl 
                text-center"
              >

                {/* dot */}
                <div className="mx-auto mb-6 
                w-4 h-4 rounded-full 
                bg-blue-500 
                shadow-lg" />

                <h3 className="text-3xl 
                font-bold text-blue-500">
                  {step.num}
                </h3>

                <h4 className="text-xl 
                font-semibold mt-2">
                  {step.title}
                </h4>

                <p className="text-gray-400 
                mt-3">
                  {step.desc}
                </p>

              </motion.div>
            ))}

          </div>

        </div>

      </div>
    </section>
  );
}