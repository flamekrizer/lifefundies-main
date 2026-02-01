"use client";
import { useState } from "react";
import DomainModal from "./DomainModal";
import { motion } from "framer-motion";

const domains = [
 "Health & Fitness","Career & Work","Education & Learning",
 "Finance & Money","Relationships","Personal Growth",
 "Spirituality & Inner Peace","Social Life",
 "Entertainment & Fun","Lifestyle",
 "Technology & Digital Life","Family Responsibilities",
 "Love & Intimacy","Creativity",
 "Society & Contribution","Self-Identity",
 "Stress & Challenges","Dreams & Aspirations"
];

export default function Domains() {

 const [active,setActive] = useState(null);

 const handleDomainClick = (title) => {
  console.log("=== DOMAIN CLICKED ===");
  console.log("Domain:", title);
  setActive(title);
  console.log("Active set to:", title);
 };

 return (
  <section className="bg-[url('/bg1.jpg')] bg-center bg-cover text-white py-32 relative">

   {/* HEADING */}
   <motion.h2 
    initial={{opacity:0, y:20}}
    whileInView={{opacity:1, y:0}}
    transition={{duration:0.6}}
    className="text-4xl md:text-6xl 
                  font-bold text-center mb-24"
   >
    18 Life Domains We Support
   </motion.h2>

   {/* GRID */}
   <div className="max-w-7xl mx-auto 
                   grid grid-cols-1 
                   md:grid-cols-2 
                   lg:grid-cols-3 
                   gap-10 px-6">

    {domains.map((title,i)=>(
     <motion.div
      key={i}
      initial={{opacity:0, y:20}}
      whileInView={{opacity:1, y:0}}
      transition={{delay: i * 0.05}}
      whileHover={{scale:1.05, y:-5}}
      whileTap={{scale:0.97}}
      onClick={()=>handleDomainClick(title)}
      className="cursor-pointer 
                 bg-gradient-to-br from-white/10 to-white/5
                 backdrop-blur-xl
                 border border-white/20
                 rounded-2xl
                 p-8
                 shadow-xl
                 hover:border-blue-500
                 hover:shadow-[0_0_40px_rgba(59,130,246,0.6)]
                 transition-all duration-300
                 group"
     >

      <h3 className="text-xl font-bold mb-3 group-hover:text-blue-400 transition-colors">
       {title}
      </h3>

      <p className="text-gray-400 text-sm group-hover:text-gray-300">
       Tap to explore guidance →
      </p>

     </motion.div>
    ))}

   </div>

   {/* MODAL */}
   {active && (
    <>
     {console.log("=== RENDERING MODAL ===", active)}
     <DomainModal 
      domain={active} 
      close={()=>{
        console.log("=== CLOSING MODAL ===");
        setActive(null);
      }} 
     />
    </>
   )}

  </section>
 );
}