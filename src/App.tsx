import Chat from "./components/chat/Chat";
import Detail from "./components/detail/Detail";
import List from "./components/list/List";
import Auth from "./components/auth/Auth";
import { Toaster } from "./components/ui/sonner";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { auth } from "./lib/firebase";
import { useUserStore } from "./store/userStore";
import LoadingSpinner from "./components/LoadingSpinner";
import { useChatStore } from "./store/chatStore";
import { EmptyViewChat, EmptyViewDetail } from "./components/EmptyView";

export default function App() {
  const currentUser = useUserStore((state) => state.currentUser);
  const isLoading = useUserStore((state) => state.isLoading);
  const fetchUserInfo = useUserStore((state) => state.fetchUserInfo);
  const chatId = useChatStore((state) => state.chatId);

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    });

    return () => unSub();
  }, [fetchUserInfo]);

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-tr from-indigo-400  to-cyan-400">
      <Toaster position="bottom-right" />
      <div className="w-[1200px] h-[600px] m-3 bg-[#f3f4f6] rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden">
        <div className="flex">
          <>
            {isLoading ? (
              <LoadingSpinner />
            ) : currentUser ? (
              <>
                <List />
                {chatId ? (
                  <>
                    <Chat />
                    <Detail />
                  </>
                ) : (
                  <>
                    <EmptyViewChat />
                    <EmptyViewDetail />
                  </>
                )}
              </>
            ) : (
              <Auth />
            )}
          </>
        </div>
      </div>
    </div>
  );
}
