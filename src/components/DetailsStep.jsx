import { useState } from "react";
import InstallPWA from '@/components/InstallPWA';

export default function DetailsStep({next,back}){

 const [name,setName]=useState("");
 const [phone,setPhone]=useState("");

 return(
  <>
   <h2 className="text-3xl mb-8">
    Your Details
   </h2>

   <input
    placeholder="Name"
    onChange={(e)=>setName(e.target.value)}
    className="w-full p-3 mb-4 
    bg-black border"/>

   <input
    placeholder="Phone"
    onChange={(e)=>setPhone(e.target.value)}
    className="w-full p-3 mb-4 
    bg-black border"/>

   <button
    onClick={()=>next({name,phone})}
    className="w-full bg-blue-500 
    p-3 rounded">
    Continue
   </button>

   <button
    onClick={back}
    className="mt-4 text-gray-400">
    ← Back
   </button>

   <InstallPWA />
  </>
 )
}