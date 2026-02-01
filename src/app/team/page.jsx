"use client";
import Link from "next/link";
import Image from "next/image";
import { teamMembers, advisors } from "@/data/team";
import Footer from "@/components/Footer";
import SideMenu from "@/components/SideMenu";
import { useState } from "react";

export default function TeamPage() {
    const [menuOpen, setMenuOpen] = useState(false);
  return (<>

    <main className="bg-black text-white px-6 py-20 min-h-screen">

      {/* HERO */}
      <section className="text-center max-w-3xl mx-auto mb-20">
        <h1 className="text-5xl font-bold mb-6">
          Meet Our Team
        </h1>
        {/* hamburger  */}
        <button
        onClick={() => setMenuOpen(true)}
        className="fixed top-6 right-6 z-[9999] 
        text-white text-3xl"
      >
        ☰
      </button>
      <SideMenu open={menuOpen} setOpen={setMenuOpen} />
      
        <p className="text-gray-400 text-lg">
          We’re not counsellors. We’re companions in clarity.  
          Real people solving real-life problems — honestly & humanly.
        </p>
      </section>

      {/* CORE TEAM */}
      <section className="max-w-6xl mx-auto mb-28">
        <h2 className="text-3xl font-semibold mb-10 text-center">
          Core Team
        </h2>

        <div className="grid md:grid-cols-3 gap-10">
          {teamMembers.map(member => (
            <Link
              key={member.slug}
              href={`/team/${member.slug}`}
              className="group bg-white/5 p-6 rounded-2xl 
                         hover:bg-white/10 transition"
            >
              <Image
                src={member.image}
                alt={member.name}
                width={400}
                height={400}
                className="rounded-xl mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold group-hover:text-blue-400 transition">
                {member.name}
              </h3>
              <p className="text-gray-400">
                {member.role}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* GLOBAL ADVISORS */}
      <section className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-semibold mb-10 text-center">
          Global Advisors
        </h2>

        <div className="grid md:grid-cols-2 gap-10">
          {advisors.map(advisor => (
            <Link
              key={advisor.slug}
              href={`/team/${advisor.slug}`}
              className="group bg-white/5 p-8 rounded-2xl 
                         hover:bg-white/10 transition flex gap-6 items-center"
            >
              <Image
                src={advisor.image}
                alt={advisor.name}
                width={160}
                height={160}
                className="rounded-xl object-cover"
              />
              <div>
                <h3 className="text-xl font-semibold group-hover:text-blue-400 transition">
                  {advisor.name}
                </h3>
                <p className="text-gray-400 mb-2">
                  {advisor.role}
                </p>
                <p className="text-sm text-gray-500">
                  View full profile →
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
      
    </main>
    <Footer />
    </> 
  );
}