import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function getAllGuides() {
  try {
    const q = query(collection(db, "guides"), where("isActive", "==", true));

    const snapshot = await getDocs(q);

    return snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } catch (error) {
    console.error("Error fetching guides:", error);
    throw error;
  }
}

export async function getGuideById(id) {
  try {
    const docRef = doc(db, "guides", id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) return null;

    return {
      id: snapshot.id,
      ...snapshot.data(),
    };
  } catch (error) {
    console.error("Error fetching guide by ID:", error);
    throw error;
  }
}

export async function getGuideSlotsForNext7Days(guideId) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 7);

    let slots = [];

    // Primary schema: top-level guide_slots collection
    try {
      const q = query(
        collection(db, "guide_slots"),
        where("guideId", "==", guideId),
        where("isBooked", "==", false)
      );
      const snapshot = await getDocs(q);

      slots = snapshot.docs.map((slotDoc) => ({
        id: slotDoc.id,
        ...slotDoc.data(),
      }));
    } catch (err) {
      console.warn("Top-level guide_slots query failed in getGuideSlotsForNext7Days, falling back to nested subcollection:", err);
    }

    // Backward compatibility: guides/{guideId}/slots subcollection
    if (slots.length === 0) {
      const legacyQ = query(
        collection(db, "guides", guideId, "slots"),
        where("isBooked", "==", false)
      );
      const legacySnapshot = await getDocs(legacyQ);
      slots = legacySnapshot.docs.map((slotDoc) => ({
        id: slotDoc.id,
        ...slotDoc.data(),
      }));
    }

    return slots
      .filter((slot) => {
        if (!slot?.date) return false;
        const slotDate = new Date(slot.date);
        slotDate.setHours(0, 0, 0, 0);
        return slotDate >= today && slotDate <= maxDate && slot.isActive !== false;
      })
      .sort((a, b) => {
        const aKey = `${a.date || ""} ${a.time || ""}`;
        const bKey = `${b.date || ""} ${b.time || ""}`;
        return aKey.localeCompare(bKey);
      });
  } catch (error) {
    console.error("Error fetching guide slots:", error);
    throw error;
  }
}