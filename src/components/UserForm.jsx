"use client";
import { useState } from "react";

export default function UserForm({next,back}){

 const [name,setName]=useState("");
 const [phone,setPhone]=useState("");

 return(
  <>
   <h2 className="text-3xl mb-6">
    Your Details
   </h2>

   <input
    placeholder="Name"
    onChange={(e)=>setName(e.target.value)}
    className="w-full p-3 mb-4 bg-black border"
   />

   <input
    placeholder="Phone"
    onChange={(e)=>setPhone(e.target.value)}
    className="w-full p-3 mb-4 bg-black border"
   />

   <button
    onClick={()=>next({name,phone})}
    className="w-full bg-white 
    text-black p-3">
    Continue
   </button>

   <button
    onClick={back}
    className="mt-4 text-gray-400">
    ← Back
   </button>
  </>
 )
}