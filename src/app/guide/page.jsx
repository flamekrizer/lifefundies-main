"use client";
import { motion } from "framer-motion";

export default function GuidePage() {
  return (
    <main className="bg-[url('/bg1.jpg')] bg-cover bg-center text-white">

      {/* HERO */}
      <section className="min-h-[60vh] 
      flex flex-col justify-center 
      items-center text-center px-6">

        <motion.h1
          initial={{opacity:0,y:20}}
          animate={{opacity:1,y:0}}
          className="text-5xl md:text-7xl 
          font-bold mb-6"
        >
          Become a <span className="text-blue-500">Guide</span>
        </motion.h1>

        <p className="text-gray-400 
        max-w-xl">
          Help people. Share wisdom.  
          Earn respect & income while 
          changing lives anonymously.
        </p>
      </section>

      {/* WHY GUIDE */}
      <section className="max-w-5xl
      mx-auto  px-1 grid 
      md:grid-cols-2 gap-10 
      items-center  mb-20"> 

        <motion.div
          initial={{opacity:0,x:-30}}
          whileInView={{opacity:1,x:0}}
        >
          <h2 className="text-3xl 
          font-bold mb-6">
            Why join LifeFundies?
          </h2>

          <ul className="space-y-4 
          text-gray-300">
            <li>✔ Earn from your knowledge</li>
            <li>✔ Work flexibly</li>
            <li>✔ Impact real lives</li>
            <li>✔ Anonymous system</li>
          </ul>
        </motion.div>

        <motion.div
          initial={{opacity:0,x:30}}
          whileInView={{opacity:1,x:0}}
          className="bg-white/5 
          p-10 rounded-2xl 
          backdrop-blur-xl 
          border border-white/10"
        >
          <h3 className="text-xl 
          font-semibold mb-4">
            Who can apply?
          </h3>

          <ul className="space-y-4 
          text-gray-300">
            <li>• Students with experience</li>
            <li>• Working professionals</li>
            <li>• Coaches & mentors</li>
            <li>• Life learners</li>
          </ul>
        </motion.div>

      </section>

      {/* FORM */}
      <section className="bg-[rgba(255,255,255,0.05)] 
      py-24">

        <div className="max-w-4xl 
        mx-auto px-6">

          <motion.h2
            initial={{opacity:0,y:20}}
            whileInView={{opacity:1,y:0}}
            className="text-4xl 
            font-bold mb-10 text-center"
          >
            Apply as a Guide
          </motion.h2>

          <div className="bg-white/5 
          p-10 rounded-2xl 
          backdrop-blur-xl 
          border border-white/10">

            <input
              placeholder="Your Name"
              className="w-full p-4 
              mb-4 bg-black border"
            />

            <input
              placeholder="Email"
              className="w-full p-4 
              mb-4 bg-black border"
            />

            <input
              placeholder="Phone"
              className="w-full p-4 
              mb-4 bg-black border"
            />

            <textarea
              placeholder="Your expertise"
              className="w-full p-4 
              mb-4 bg-black border h-32"
            />

            <button
              className="w-full 
              bg-blue-500 p-4 
              rounded hover:bg-blue-600"
            >
              Submit Application
            </button>

          </div>

        </div>
      </section>

    </main>
  );
}