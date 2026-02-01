"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import SideMenu from "@/components/SideMenu";
import { useAuth } from "@/lib/useAuth";


export default function Hero() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useAuth();

  const handleLogin = async () => {
  try {
    const res = await anonymousLogin();
    console.log("User:", res.user.uid);
  } catch (err) {
    console.log(err);
  }
};

  const handleExplore = () => {
    if(user){
      router.push("/book");
    } else {
      router.push("/login");
    }
  };

  return (
    <>
      {/* HAMBURGER */}
      <button
        onClick={() => setMenuOpen(true)}
        className="fixed top-6 right-6 z-[9999] 
        text-white text-3xl"
      >
        ☰
      </button>
    {/* Profile button*/}
      <button
        onClick={() => router.push("/profile")}
        className="fixed top-6 left-6 z-[9999]
        text-white text-3xl"
      >
        👤
      </button>

      {/* MENU */}
      <SideMenu open={menuOpen} setOpen={setMenuOpen} />

      <section
        className="relative h-screen flex items-center  justify-center
        text-white overflow-hidden"
        style={{
          backgroundImage: "url('/k.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        {/* dark overlay */}
        <div className="absolute inset-0 bg-black/30 pointer-events-none" />

        {/* content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 text-center "
        >
         

<button
  onClick={handleLogin}
  className="border  absolute top-28 left-40  transform -translate-x-1/2 -translate-y-1/2 px-10 py-6 cursor-pointer
  hover:bg-white hover:text-black transition"
>
            EXPLORE
            
          </button>
        </motion.div>

        {/* bottom fade */}
        <div
          className="absolute bottom-0 left-0 w-full h-40 
          bg-gradient-to-b 
          from-transparent to-[#0b0f1a]
          pointer-events-none"
        />

        {/* scroll text */}
        <motion.p
          className="absolute right-10 bottom-30 
          rotate-90 tracking-widest text-xl opacity-70
          pointer-events-none"
          animate={{ x: [0, 8, 0] }}
          transition={{
            duration: 0.3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          SCROLL DOWN →
        </motion.p>

        
      </section>
    </>
  );
}