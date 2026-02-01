import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { generateLFID } from "./lfid";

export const createUserDoc = async (uid) => {
  const lfid = generateLFID();

  await setDoc(doc(db, "users", uid), {
    lfid,
    sessions: 0,
    wallet: 0,
    createdAt: new Date()
  });
};