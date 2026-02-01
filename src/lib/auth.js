import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { signOut } from "firebase/auth";

import { auth } from "./firebase";
import { createUserDoc } from "./userService";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { user, loading };
}
// 🔹 Upgrade Anonymous → Email
export const upgradeWithEmail = async (email, password) => {
  if (!auth.currentUser || !auth.currentUser.isAnonymous) {
    throw new Error("User is not anonymous");
  }

  const credential = EmailAuthProvider.credential(email, password);
  const res = await linkWithCredential(auth.currentUser, credential);

  return res.user;
};
export const upgradeWithGoogle = async () => {
  if (!auth.currentUser || !auth.currentUser.isAnonymous) {
    throw new Error("User is not anonymous");
  }

  const provider = new GoogleAuthProvider();
  const res = await linkWithPopup(auth.currentUser, provider);

  return res.user;
};
// EMAIL SIGNUP
export const signupUser = async (email, password) => {
  const res = await createUserWithEmailAndPassword(auth, email, password);
  await createUserDoc(res.user.uid);
  return res.user;
};
export const logoutUser = () => signOut(auth);
// EMAIL LOGIN
export const loginUser = async (email, password) => {
  const res = await signInWithEmailAndPassword(auth, email, password);
  return res.user;
};

// ANONYMOUS LOGIN
export const anonymousLogin = async () => {
  const res = await signInAnonymously(auth);

  // 🔥 SAFETY CHECK
  if (res?.user?.uid) {
    await createUserDoc(res.user.uid);
  }

  return res.user;
};
// GOOGLE LOGIN
export const googleLogin = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const res = await signInWithPopup(auth, provider);
    await createUserDoc(res.user.uid);
    return res.user;
  } catch (err) {
    // 🔥 fallback
    if (err.code === "auth/popup-blocked" || err.code === "auth/cancelled-popup-request") {
      await signInWithRedirect(auth, provider);
    } else {
      throw err;
    }
  }
};