"use client";
import FaqSection from "@/components/FaqSection";
import Image from "next/image";
import { useState } from "react";
import SideMenu from "@/components/SideMenu";
import Footer from "@/components/Footer";

export default function FaqPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (<>


    <main
      className="relative min-h-screen text-white bg-cover bg-center"
      style={{ backgroundImage: "url('/bg.jpeg')" }}
    >
      {/* dark overlay */}
      <div className="absolute inset-0 bg-black/70" />
      
      {/* hamburger  */}
      <button
        onClick={() => setMenuOpen(true)}
        className="fixed top-6 right-6 z-[9999] 
        text-white text-3xl"
      >
        ☰
      </button>
      <SideMenu open={menuOpen} setOpen={setMenuOpen} />  

      


      {/* content */}
      <div className="relative z-10 py-20">

        <FaqSection />
      </div>
      
        
   
    </main>
   <Footer />
   </>
  );
}