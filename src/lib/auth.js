import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  EmailAuthProvider,
  linkWithCredential,
  linkWithPopup,
} from "firebase/auth";

import { auth } from "./firebase";

// EMAIL SIGNUP
export const signupUser = async (email, password) => {
  const res = await createUserWithEmailAndPassword(auth, email, password);
  return res.user;
};

// EMAIL LOGIN
export const loginUser = async (email, password) => {
  const res = await signInWithEmailAndPassword(auth, email, password);
  return res.user;
};

// ANONYMOUS LOGIN
export const anonymousLogin = async () => {
  const res = await signInAnonymously(auth);
  return res.user;
};

// GOOGLE LOGIN
export const googleLogin = async () => {
  const provider = new GoogleAuthProvider();
  const res = await signInWithPopup(auth, provider);
  return res.user;
};

// LOGOUT
export const logoutUser = () => signOut(auth);

// 🔥 ANONYMOUS → EMAIL
export const upgradeWithEmail = async (email, password) => {
  if (!auth.currentUser?.isAnonymous) {
    throw new Error("User is not anonymous");
  }

  const credential = EmailAuthProvider.credential(email, password);
  const res = await linkWithCredential(auth.currentUser, credential);
  return res.user;
};

// 🔥 ANONYMOUS → GOOGLE
export const upgradeWithGoogle = async () => {
  if (!auth.currentUser?.isAnonymous) {
    throw new Error("User is not anonymous");
  }

  const provider = new GoogleAuthProvider();
  const res = await linkWithPopup(auth.currentUser, provider);
  return res.user;
};