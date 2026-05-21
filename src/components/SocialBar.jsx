"use client"
import { FaInstagram, FaLinkedin, FaYoutube, FaTwitter } from "react-icons/fa";

export default function SocialBar() {
  return (
    <div className="flex flex-col gap-5 fixed left-6 top-1/2 -translate-y-1/2 z-50">

      <a href="https://www.instagram.com/lifefundies/" target="_blank" rel="noopener noreferrer">
        <FaInstagram
          className="
          text-4xl text-pink-400 cursor-pointer
          transition-all duration-300
          hover:text-blue-500
          hover:scale-125
          hover:drop-shadow-[0_0_12px_rgba(59,130,246,0.9)]
          "
        />
      </a>

      <a href="https://www.linkedin.com/company/lifefundies/" target="_blank" rel="noopener noreferrer">
        <FaLinkedin
          className="
          text-4xl text-blue-400 cursor-pointer
          transition-all duration-300
          hover:text-blue-500
          hover:scale-125
          hover:drop-shadow-[0_0_12px_rgba(59,130,246,0.9)]
          "
        />
      </a>

      <a href="https://www.youtube.com/@LifeFundies" target="_blank" rel="noopener noreferrer">
        <FaYoutube
          className="
          text-4xl text-red-400 cursor-pointer
          transition-all duration-300
          hover:text-blue-500
          hover:scale-125
          hover:drop-shadow-[0_0_12px_rgba(59,130,246,0.9)]
          "
        />
      </a>

      <a href="https://twitter.com/lifefundies" target="_blank" rel="noopener noreferrer">
        <FaTwitter
          className="
          text-4xl text-amber-400 cursor-pointer
          transition-all duration-300
          hover:text-blue-500
          hover:scale-125
          hover:drop-shadow-[0_0_12px_rgba(59,130,246,0.9)]
          "
        />
      </a>

    </div>
  );
}