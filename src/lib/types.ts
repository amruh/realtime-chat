export type TUser = {
  id: string;
  username: string;
  email: string;
  avatar: string;
  blocked: string[];
};

export type TChats = {
  chatId: string;
  lastMessage: string;
  receiverId: string;
  updatedAt: number;
  isSeen: boolean;
};

export type TChatAndUser = TChats & {
  user: TUser;
};

export type TUserChats = {
  chats: TChats[] | [];
};

export type TMessage = {
  text: string;
  image: string;
  createdAt: number;
  senderId: string;
}

export type Chats = {
  createdAt: Date,
  messages: TMessage[] | []
}

