import {
  ChevronDownIcon,
  ChevronUpIcon,
  DownloadIcon,
} from "@radix-ui/react-icons";
import { Button } from "../ui/button";
import { auth, db } from "../../lib/firebase";
import { useChatStore } from "../../store/chatStore";
import { useUserStore } from "../../store/userStore";
import AvatarPlaceholder from "../AvatarPlaceholder";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";

export default function Detail() {
  const user = useChatStore((state) => state.user);
  const changeBlock = useChatStore((state) => state.changeBlock);
  const isReceiverBlocked = useChatStore((state) => state.isReceiverBlocked);
  const isCurrentUserBlocked = useChatStore(
    (state) => state.isCurrentUserBlocked
  );

  const currentUser = useUserStore((state) => state.currentUser);

  const handleBlock = async () => {
    if (!user || !currentUser) return;

    const userDocRef = doc(db, "users", currentUser.id);

    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex-[1]">
      <div className="flex flex-col items-center p-4 border-b border-slate-300">
        {user?.avatar ? (
          <div className="size-20 rounded-full overflow-hidden">
            <img src={user.avatar} className="h-full w-full object-cover" />
          </div>
        ) : (
          <AvatarPlaceholder bgClassName="size-20" iconClassName="size-10" />
        )}
        <h2 className="font-semibold text-xl">{user?.username}</h2>
        <p className="text-sm">Lorem ipsum dolor sit amet.</p>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <p>Chat Settings</p>
          <ChevronDownIcon className="size-5" />
        </div>
        <div className="flex justify-between items-center">
          <p>Privacy & Help</p>
          <ChevronDownIcon className="size-5" />
        </div>
        <div className="flex justify-between items-center">
          <p>Shared Photos</p>
          <ChevronUpIcon className="size-5" />
        </div>
        {[...Array(3).keys()].map((item) => (
          <div key={item} className="flex justify-between items-center">
            <div className="flex items-center gap-x-2">
              <img
                className="rounded-md size-11"
                src="https://images.pexels.com/photos/16848795/pexels-photo-16848795/free-photo-of-relaxation-in-luxembourg-garden.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="the image"
              />
              <span>photo_2024_{item + 1}.png</span>
            </div>
            <DownloadIcon className="size-5" />
          </div>
        ))}
        <div className="flex justify-between items-center">
          <p>Shared Files</p>
          <ChevronUpIcon className="size-5" />
        </div>
        <Button
          className="w-full bg-red-600 hover:bg-red-600/80"
          onClick={handleBlock}
        >
          {isCurrentUserBlocked
            ? "You are Blocked!"
            : isReceiverBlocked
            ? "User blocked"
            : "Block User"}
        </Button>
        <Button
          className="w-full bg-sky-600 hover:bg-sky-600/80"
          onClick={() => auth.signOut()}
        >
          Logout
        </Button>
      </div>
    </div>
  );
}
