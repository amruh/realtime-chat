import { create } from "zustand";
import { TUser } from "../lib/types";
import { useUserStore } from "./userStore";

type Store = {
  chatId: string | null;
  user: TUser| null;
  isCurrentUserBlocked: boolean;
  isReceiverBlocked: boolean;
  changeChat: (chatId: string, user: TUser) => void;
  changeBlock: () => void;
};

export const useChatStore = create<Store>((set) => ({
  chatId: null,
  user: null,
  isCurrentUserBlocked: false,
  isReceiverBlocked: false,
  changeChat: (chatId: string, user: TUser) => {
    const currentUser = useUserStore.getState().currentUser;

    if (currentUser) {
      if (user.blocked.includes(currentUser.id)) {
        // Check if current user is blocked
        return set({
          chatId,
          user: null,
          isCurrentUserBlocked: true,
          isReceiverBlocked: false,
        });
      } else if (currentUser.blocked.includes(user.id)) {
        // Check if receiver is blocked
        return set({
          chatId,
          user: null,
          isCurrentUserBlocked: false,
          isReceiverBlocked: true,
        });
      } else {
        set({
          chatId,
          user,
          isCurrentUserBlocked: false,
          isReceiverBlocked: false,
        });
      }
    } else {
      console.log("Not authenticated");
    }
  },
  changeBlock: () => {
    set((state) => ({ ...state, isReceiverBlocked: !state.isReceiverBlocked }));
  },
}));
