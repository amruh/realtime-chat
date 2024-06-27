import { doc, getDoc } from "firebase/firestore";
import { create } from "zustand";
import { db } from "../lib/firebase";
import { TUser } from "../lib/types";

type Store = {
  currentUser: TUser | null;
  isLoading: boolean;
  fetchUserInfo: (uid?: string) => Promise<void>;
};

export const useUserStore = create<Store>((set) => ({
  currentUser: null,
  isLoading: true,
  fetchUserInfo: async (uid?: string) => {
    if (!uid) return set({ currentUser: null, isLoading: false });

    try {
      const docSnap = await getDoc(doc(db, "users", uid));

      if (docSnap.exists()) {
        set({ currentUser: docSnap.data() as TUser, isLoading: false });
      } else {
        set({ currentUser: null, isLoading: false });
      }
    } catch (error) {
      console.log(error);

      return set({ currentUser: null, isLoading: false });
    }
  },
}));
