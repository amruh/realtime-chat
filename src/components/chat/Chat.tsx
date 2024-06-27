import {
  CameraIcon,
  ImageIcon,
  InfoCircledIcon,
  PaperPlaneIcon,
} from "@radix-ui/react-icons";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  FaceSmileIcon,
  PhoneIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import { useEffect, useRef, useState } from "react";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../store/chatStore";
import { useUserStore } from "../../store/userStore";
import { Chats, TUserChats } from "../../lib/types";
import { cn } from "../../lib/utils";
import { upload } from "../../lib/upload";
import { Label } from "../ui/label";
import AvatarPlaceholder from "../AvatarPlaceholder";

export default function Chat() {
  const [openEmoji, setOpenEmoji] = useState(false);
  const [text, setText] = useState("");
  const [chat, setChat] = useState<Chats>();
  const [img, setImg] = useState<{ file: File | null; url: string }>({
    file: null,
    url: "",
  });
  const chatId = useChatStore((state) => state.chatId);
  const user = useChatStore((state) => state.user);
  const currentUser = useUserStore((state) => state.currentUser);
  const endRef = useRef<HTMLDivElement>(null);
  const isReceiverBlocked = useChatStore((state) => state.isReceiverBlocked);
  const isCurrentUserBlocked = useChatStore(
    (state) => state.isCurrentUserBlocked
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    let unsub = () => {};

    if (chatId) {
      unsub = onSnapshot(doc(db, "chats", chatId), (res) => {
        const chats = res.data() as Chats;

        setChat(chats);
      });
    }

    return () => unsub();
  }, [chatId]);

  const handleSelectEmoji = (e: EmojiClickData) => {
    setText((prev) => prev + e.emoji);
    setOpenEmoji(false);
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleSend = async () => {
    if (!text || text === "") return;
    if (!currentUser || !user || !chatId) return;

    let imgURL = null;
    if (img.file) {
      imgURL = await upload(img.file);
    }

    try {
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser?.id,
          text,
          createdAt: new Date(),
          ...(imgURL && Object.assign({ image: imgURL })),
        }),
      });

      const userIDs = [currentUser.id, user.id];

      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "userChats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data() as TUserChats;

          const chatIndex = userChatsData.chats.findIndex(
            (chat) => chat.chatId === chatId
          );

          userChatsData.chats[chatIndex].lastMessage = text;
          userChatsData.chats[chatIndex].isSeen =
            id === currentUser.id ? true : false;
          userChatsData.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      });

      setImg({
        file: null,
        url: "",
      });
      setText("");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex-[2] flex flex-col border-l border-r border-slate-300 h-[600px]">
      {/* User header */}
      <div className="flex items-center justify-between border-b border-slate-300 p-4">
        <div className="flex items-center gap-x-3">
          {user?.avatar ? (
            <div className="size-12 rounded-full overflow-hidden">
              <img src={user.avatar} className="h-full w-full object-cover" />
            </div>
          ) : (
            <AvatarPlaceholder bgClassName="size-12" />
          )}
          <div>
            <span className="font-semibold">{user?.username}</span>
            <p>Lorem ipsum dolor sit amet.</p>
          </div>
        </div>
        <div className="flex items-center gap-x-3">
          <PhoneIcon className="size-6 cursor-pointer" />
          <VideoCameraIcon className="size-6 cursor-pointer" />
          <InfoCircledIcon className="size-6 cursor-pointer" />
        </div>
      </div>

      {/* Conversation */}
      <div className="flex flex-col flex-[1] gap-y-4 overflow-auto p-4 text-sm text-white">
        {chat?.messages.length === 0 ? (
          <p className="text-slate-500 text-center">Start conversation</p>
        ) : (
          chat?.messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex flex-col max-w-[70%] place-self-start bg-cyan-600 p-3 rounded-lg",
                {
                  "place-self-end bg-sky-600":
                    currentUser?.id === message.senderId,
                }
              )}
            >
              {message.image && <img src={message.image} alt="chat image" />}
              <p>{message.text}</p>
              {/* <span className="text-xs place-self-end">1 min ago</span> */}
            </div>
          ))
        )}
        <div ref={endRef}></div>
      </div>

      {/* Text Message tool */}
      <div className="flex items-center gap-3 text-slate-700 p-4 border-t border-slate-300 relative">
        {img.url && (
          <div className="backdrop-blur-xl bg-white/30 p-4 absolute -top-[250px] right-0 left-0 h-[250px] overflow-y-auto">
            <img src={img.url} alt="" className="h-auto w-full" />
          </div>
        )}
        {!isCurrentUserBlocked && !isReceiverBlocked && (
          <div className="flex gap-2">
            <Label htmlFor="file">
              <ImageIcon className="size-5 cursor-pointer" />
            </Label>
            <CameraIcon className="size-5" />
            <VideoCameraIcon className="size-5" />
          </div>
        )}
        <Input
          type="file"
          className="hidden"
          id="file"
          onChange={handleImage}
        />
        <Input
          placeholder="Type a message..."
          className="flex-1"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        />
        <div className="flex items-center gap-2 relative">
          <FaceSmileIcon
            className={cn("size-7", {
              hidden: !isCurrentUserBlocked || !isReceiverBlocked,
            })}
            onClick={() => setOpenEmoji((prev) => !prev)}
          />
          <div className="absolute bottom-10 -right-28">
            <EmojiPicker
              style={{}}
              open={openEmoji}
              onEmojiClick={handleSelectEmoji}
            />
          </div>
          <Button
            size="icon"
            className="bg-sky-600"
            onClick={handleSend}
            disabled={isCurrentUserBlocked || isReceiverBlocked}
          >
            <PaperPlaneIcon className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
