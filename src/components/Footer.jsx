"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="
    bg-[url('/bg1.jpg')] bg-center bg-cover
    text-white pt-28 pb-10">

      <div className="max-w-7xl mx-auto px-6">

        <div className="
        grid 
        grid-cols-1 
        md:grid-cols-4 
        gap-16">

          {/* BRAND */}
          <motion.div
            initial={{opacity:0,y:30}}
            whileInView={{opacity:1,y:0}}
          >
            <Image
              src="/logo.jpeg"
              alt="LifeFundies Logo"
              width={128}
              height={128}
              className="w-32 mb-6"
            />

            <p className="text-gray-300 leading-relaxed text-sm">
              Feeling stuck? Confused about what to do next?
              <br /><br />
              Don’t worry. We’re building a new generation of
              youth who speak freely, grow wisely,
              and lead fearlessly.
            </p>
          </motion.div>

          {/* QUICK SESSION */}
          <motion.div
            initial={{opacity:0,y:30}}
            whileInView={{opacity:1,y:0}}
            transition={{delay:0.1}}
          >
            <h3 className="text-lg font-semibold mb-6 tracking-wider">
              QUICK SESSION
            </h3>

            <ul className="space-y-4 text-gray-300 text-sm">
              {[
                "FREE GUIDANCE SESSION",
                "PEER GUIDANCE SESSION",
                "YOUNG MENTOR SESSION",
                "SENIOR ADVISOR SESSION"
              ].map((item,i)=>(
                <li 
                  key={i}
                  className="hover:text-blue-400 
                  cursor-pointer transition">
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* COMPANY */}
          <motion.div
            initial={{opacity:0,y:30}}
            whileInView={{opacity:1,y:0}}
            transition={{delay:0.2}}
          >
            <h3 className="text-lg font-semibold mb-6 tracking-wider">
              COMPANY
            </h3>

            <ul className="space-y-4 text-gray-300 text-sm">
              {[
                "About us",
                "Team",
                "Contact Us",
                "Terms & Conditions",
                "Privacy Policy"
              ].map((item,i)=>(
                <li 
                  key={i}
                  className="hover:text-blue-400 
                  cursor-pointer transition">
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* CONTACT */}
          <motion.div
            initial={{opacity:0,y:30}}
            whileInView={{opacity:1,y:0}}
            transition={{delay:0.3}}
          >
            <h3 className="text-lg font-semibold mb-6 tracking-wider">
              GET IN TOUCH
            </h3>

            <p className="text-gray-300 text-sm mb-2">
              Online
            </p>

            <p className="text-gray-300 text-sm mb-6">
              support@lifefundies.in
            </p>

            {/* SOCIAL */}
            <div className="flex gap-4 mb-6">
              {[
                {name:"in",color:"bg-blue-600"},
                {name:"ig",color:"bg-pink-600"},
                {name:"yt",color:"bg-red-600"},
              ].map((s,i)=>(
                <div
                  key={i}
                  className={`${s.color} 
                  w-11 h-11 rounded-full 
                  flex items-center 
                  justify-center 
                  cursor-pointer 
                  hover:scale-110 
                  transition`}
                >
                  {s.name}
                </div>
              ))}
            </div>

            {/* PHONE */}
            <div className="flex items-center gap-3">
              <span className="text-xl">📞</span>
              <p className="font-semibold text-lg">
                +91-7055984498
              </p>
            </div>

          </motion.div>

        </div>

        {/* BOTTOM */}
        <div className="
        border-t border-white/10 
        mt-20 pt-6
        text-center 
        text-gray-400 text-sm">

          © 2026 LifeFundies. All rights reserved.
        </div>

      </div>
    </footer>
  );
}