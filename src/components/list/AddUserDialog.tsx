import { Dispatch, SetStateAction, useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import AvatarPlaceholder from "../AvatarPlaceholder";
import { useDebouncedCallback } from "use-debounce";
import { arrayUnion, collection, doc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { TUser } from "../../lib/types";
import { useUserStore } from "../../store/userStore";

export function AddUserDialog({
  isDialogOpen,
  setIsDialogOpen,
}: {
  isDialogOpen: boolean;
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const currentUser = useUserStore((state) => state.currentUser);

  const [user, setUser] = useState<TUser | null>(null);

  const handleSearch = useDebouncedCallback(async (term: string) => {
    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", term));

      const querySnapShot = await getDocs(q);

      if (!querySnapShot.empty) {
        setUser(querySnapShot.docs[0]?.data() as TUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.log(error);
    }
  }, 300);

  const handleAddUser = async () => {
    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userChats");

    try {
      const newChatRef = doc(chatRef);

      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: []
      });

      await updateDoc(doc(userChatsRef, user!.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser?.id,
          updatedAt: Date.now()

        })
      });

      await updateDoc(doc(userChatsRef, currentUser?.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: user!.id,
          updatedAt: Date.now()

        })
      });
      
    } catch (error) {
      console.log(error);
    } 
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Users</DialogTitle>
          <DialogDescription>
            Search user and add it to your chat list.
          </DialogDescription>
        </DialogHeader>
        <Input
          id="search"
          placeholder="Search user..."
          onChange={(e) => handleSearch(e.target.value)}
        />
        {user ? (
          <div className="flex justify-between items-center">
            <div className="flex gap-x-2 items-center">
              {user.avatar ? (
                <div className="size-10 rounded-full overflow-hidden">
                  <img
                    src={user.avatar}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <AvatarPlaceholder />
              )}
              <p className="font-semibold">{user.username}</p>
            </div>
            <Button size="sm" variant="chatTheme" onClick={handleAddUser}>
              Add User
            </Button>
          </div>
        ) : (
          <div className="flex justify-center">
            <p className="text-xs">Start typing or no user found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
