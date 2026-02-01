"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Preloader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // 2 sec loader

    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 
      bg-black z-[10000] 
      flex items-center 
      justify-center"
    >
      <motion.h1
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        className="text-white 
        text-3xl md:text-5xl 
        font-bold tracking-widest"
      >
        LIFE<span className="text-blue-500">FUNDIES</span>
      </motion.h1>
    </motion.div>
  );
}