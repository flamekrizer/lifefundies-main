import { 
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";

import { auth } from "./firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export const googleLogin = () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

// Anonymous login
export const anonymousLogin = () => {
  return signInAnonymously(auth);
};

// Email signup
export const emailSignup = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// Email login
export const emailLogin = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Logout
export const logout = () => {
  return signOut(auth);
};