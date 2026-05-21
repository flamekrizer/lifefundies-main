"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

/**
 * useAuth
 * Central hook to get current firebase user
 */
export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!auth);

  useEffect(() => {
    if (!auth) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    user,          // firebase user object
    loading,       // true until auth state resolved
    isLoggedIn: !!user,
    isAnonymous: user?.isAnonymous || false,
    uid: user?.uid || null,
    email: user?.email || null,
  };
}