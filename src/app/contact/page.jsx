"use client";
import { useState } from "react";
import SideMenu from "@/components/SideMenu";
import Footer from "@/components/Footer";

export default function ContactPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <main
        className="relative min-h-screen text-white bg-cover bg-center"
        style={{ backgroundImage: "url('/bg2.jpeg')" }}
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
        <div className="relative z-10 py-20 px-6 max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 text-center">
            Contact Us
          </h1>
          <p className="text-gray-300 mb-8 text-center">
            Have questions or need support? We&apos;re here to help!
          </p>
          <form className="space-y-6">
            <div>
              <label className="block mb-2">Name</label>
              <input
                type="text"
                className="w-full p-3 rounded bg-white/10 border border-gray-600"
                placeholder="Your Name"
              />
            </div>
            <div>
              <label className="block mb-2">Email</label>
              <input
                type="email"
                className="w-full p-3 rounded bg-white/10 border border-gray-600"
                placeholder="Enter your email"
                />
                </div>  
            <div>
                <label className="block mb-2">Message</label>
                <textarea
                    className="w-full p-3 rounded bg-white/10 border border-gray-600"   
                    rows="5"
                    placeholder="Your message"
                ></textarea>
            </div>
            <button
                type="submit"
                className="px-6 py-3 bg-blue-600 rounded hover:bg-blue-700 transition"
            >
                Send Message
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );




}

