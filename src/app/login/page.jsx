"use client";
import { useState } from "react";
import { loginUser, googleLogin, anonymousLogin } from "@/lib/auth";
import { useRouter } from "next/navigation";
import React from "react";

export default function Login() {
  const router = useRouter();
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await loginUser(email,password);
      router.push("/guides");
    } catch(err){
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-[url(/bg1.jpg)] bg-cover bg-center text-white">
      <div className="bg-white/5 p-10 rounded-xl w-87.5">

        <h2 className="text-2xl font-bold mb-6 text-center">
          Login
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 bg-black border"
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-6 bg-black border"
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 py-3 rounded mb-4"
        >
          Login
        </button>

        <button
  onClick={googleLogin}
  className="w-full border py-3 mb-3 active:scale-95"
>
  Continue with Google
</button>

        <button
  onClick={async () => {
    try {
      await anonymousLogin();
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }}
  className="w-full border py-3"
>
  Continue Anonymously
</button>
        <p 
          onClick={()=>router.push("/signup")}
          className="text-sm mt-4 text-center cursor-pointer text-blue-400"
        >
          Create new account
        </p>

      </div>
    </div>
  );
}