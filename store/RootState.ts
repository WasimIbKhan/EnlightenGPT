import Chat from "@/models/Chat";

export interface RootState {
  auth: {
    userId: String;
    isAuthenticated: boolean;
  },
  chats: {
    chats: Chat[]; // Use the Chat type here
    index: number;
    emptyChat: boolean;
  }
}
