import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { generateLFID } from "./generateLFID";

export const createUserDocIfNotExists = async (uid) => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      lfid: generateLFID(),
      sessions: 0,
      wallet: 0,
      createdAt: new Date()
    });
  }
};