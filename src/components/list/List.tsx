import {
  DotsHorizontalIcon,
  Pencil1Icon,
  PlusIcon,
} from "@radix-ui/react-icons";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { VideoCameraIcon } from "@heroicons/react/24/outline";
import { AddUserDialog } from "./AddUserDialog";
import { useUserStore } from "../../store/userStore";
import AvatarPlaceholder from "../AvatarPlaceholder";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { TChatAndUser, TUser, TUserChats } from "../../lib/types";
import { useChatStore } from "../../store/chatStore";
import { cn } from "../../lib/utils";

export default function List() {
  const currentUser = useUserStore((state) => state.currentUser);
  const changeChat = useChatStore((state) => state.changeChat);
  const chatId = useChatStore((state) => state.chatId);
  const [chats, setChats] = useState<TChatAndUser[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [input, setInput] = useState("");

  const addUserHandler = () => setIsDialogOpen(true);
  useEffect(() => {
    let unSub = () => {};

    if (currentUser) {
      unSub = onSnapshot(doc(db, "userChats", currentUser.id), async (res) => {
        const items = res.data() as TUserChats;

        const promises = items.chats.map(async (item) => {
          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(userDocRef);

          const user = userDocSnap.data() as TUser;

          return { ...item, user };
        });

        const chatData = await Promise.all(promises);

        setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
      });
    }

    return () => unSub();
  }, [currentUser]);

  const handleSelect = async (chat: TChatAndUser) => {
    if (!currentUser) return;

    if (chat.isSeen) {
      return changeChat(chat.chatId, chat.user);
    }

    const userChats = chats.map((c) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { user, ...rest } = c;
      return rest;
    });

    const chatIndex = userChats.findIndex(
      (item) => item.chatId === chat.chatId
    );

    userChats[chatIndex].isSeen = true;

    const userChatsRef = doc(db, "userChats", currentUser.id);

    try {
      await updateDoc(userChatsRef, {
        chats: userChats,
      });

      changeChat(chat.chatId, chat.user);
    } catch (error) {
      console.log(error);
    }
  };

  const filteredChats = chats.filter((c) =>
    c.user.username.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div className="flex-[1] space-y-4 overflow-auto">
      {/* User info */}
      <div className="flex justify-between items-center px-4 pt-4">
        <div className="flex items-center gap-x-3">
          {currentUser?.avatar ? (
            <div className="size-10 rounded-full overflow-hidden">
              <img
                src={currentUser.avatar}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <AvatarPlaceholder bgClassName="bg-sky-600" />
          )}
          <h2 className="font-semibold">{currentUser?.username}</h2>
        </div>
        <div className="flex items-center gap-x-3">
          <DotsHorizontalIcon className="size-4 cursor-pointer" />
          <VideoCameraIcon className="size-4 cursor-pointer" />
          <Pencil1Icon className="size-4 cursor-pointer" />
        </div>
      </div>

      {/* Chat list */}
      <div className="space-y-4">
        <div className="flex justify-between items-center gap-x-2 px-4 pt-2">
          <Input
            placeholder="Search..."
            className="flex-1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button size="icon" onClick={addUserHandler}>
            <PlusIcon className="size-5" />
          </Button>
        </div>
        <div className="max-h-[456px] overflow-auto ">
          {filteredChats.map((chat) => (
            <div
              key={chat.chatId}
              className={cn(
                "flex items-center gap-x-3 py-3 hover:bg-slate-200 px-4 cursor-pointer",
                {
                  "bg-slate-200": chat.chatId === chatId,
                  "bg-sky-600 text-white hover:text-slate-700": !chat.isSeen,
                }
              )}
              onClick={() => handleSelect(chat)}
            >
              {chat.user.avatar ? (
                <div className="size-10 rounded-full overflow-hidden">
                  <img
                    src={chat.user.avatar}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <AvatarPlaceholder
                  bgClassName={`size-12 ${!chat.isSeen ? "bg-white" : ""}`}
                  iconClassName={`size-6 ${
                    !chat.isSeen ? "text-slate-700" : ""
                  }`}
                />
              )}
              <div>
                <span className="font-semibold">{chat.user.username}</span>
                <p>
                  {chat.lastMessage.length > 17
                    ? chat.lastMessage.substring(0, 24) + "..."
                    : chat.lastMessage}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <AddUserDialog
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
      />
    </div>
  );
}
