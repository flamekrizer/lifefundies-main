"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { logoutUser } from "@/lib/auth";

export default function SideMenu({ open, setOpen }) {
  const router = useRouter();
  const { user } = useAuth();

  if (!open) return null;

  const go = (path) => {
    setOpen(false);
    router.push(path);
  };

  return (
    <div className="fixed inset-0 z-[99999]">

      {/* overlay */}
      <div
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-black/60"
      />

      {/* MENU PANEL */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute right-0 top-0 
        w-full sm:w-[420px] 
        h-full bg-black 
        text-white p-8 overflow-y-auto"
      >

        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-bold">LifeFundies</h2>
          <button
            onClick={() => setOpen(false)}
            className="text-3xl"
          >
            ✕
          </button>
        </div>

        {/* LINKS */}
        <div className="space-y-6 text-lg">

          <div onClick={() => go("/")} className="menu-link">Home</div>
          <div onClick={() => go("/about")} className="menu-link">About</div>
          <div onClick={() => go("/guide")} className="menu-link">Become a Guide</div>
          <div onClick={() => go("/faq")} className="menu-link">FAQ</div>
          <div onClick={() => go("/team")} className="menu-link">Our Team</div>
          <div onClick={() => go("/contact")} className="menu-link">Contact</div>
          

          {!user && (
            <>
              <div onClick={() => go("/login")} className="menu-link">
                Login
              </div>
              <div onClick={() => go("/signup")} className="menu-link">
                Sign Up
              </div>
            </>
          )}

          {user && (
            <>
              <div onClick={() => go("/dashboard")} className="menu-link">
                Dashboard
              </div>

              <div onClick={() => go("/book")} className="menu-link">
                Book Session
              </div>

              {user.isAnonymous && (
                <div
                  onClick={() => go("/upgrade")}
                  className="menu-link text-blue-400"
                >
                  Upgrade Account
                </div>
              )}

              <div
                onClick={async () => {
                  await logoutUser();
                  setOpen(false);
                  router.push("/login");
                }}
                className="menu-link text-red-400"
              >
                Logout
              </div>
            </>
          )}

        </div>

      </motion.div>
    </div>
  );
}