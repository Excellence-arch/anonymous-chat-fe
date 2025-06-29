import { create } from 'zustand';
import type { ChatState, Chat, User, Message } from '../types';
import { chatAPI } from '../services/api';

interface ExtendedChatState extends ChatState {
  showChatList: boolean;
  typingUsers: Record<string, boolean>;
  onlineUsers: Set<string>;
  setShowChatList: (show: boolean) => void;
  addMessage: (message: Message) => void;
  markMessagesAsRead: (userId: string) => void;
  updateUserStatus: (userId: string, isOnline: boolean) => void;
  setUserTyping: (userId: string, isTyping: boolean) => void;
  setOnlineUsers: (userIds: string[]) => void;
}

export const useChatStore = create<ExtendedChatState>((set, get) => ({
  chats: [],
  currentChat: null,
  messages: [],
  loading: false,
  showChatList: true,
  typingUsers: {},
  onlineUsers: new Set(),

  setShowChatList: (show: boolean) => {
    set({ showChatList: show });
  },

  setCurrentChat: (chat: Chat | null) => {
    set({
      currentChat: chat,
      messages: [],
    });
  },

  addMessage: (message: Message) => {
    const { currentChat, messages } = get();

    // Only add message if it's for the current chat
    if (
      currentChat &&
      (message.senderId._id === currentChat.participant._id ||
        message.receiverId._id === currentChat.participant._id)
    ) {
      set({ messages: [...messages, message] });
    }
  },

  markMessagesAsRead: (userId: string) => {
    const { messages } = get();
    const updatedMessages = messages.map((msg) =>
      msg.receiverId._id === userId ? { ...msg, isRead: true } : msg
    );
    set({ messages: updatedMessages });
  },

  updateUserStatus: (userId: string, isOnline: boolean) => {
    const { chats, currentChat, onlineUsers } = get();

    // Update online users set
    const newOnlineUsers = new Set(onlineUsers);
    if (isOnline) {
      newOnlineUsers.add(userId);
    } else {
      newOnlineUsers.delete(userId);
    }

    // Update chats
    const updatedChats = chats.map((chat) =>
      chat.participant._id === userId
        ? { ...chat, participant: { ...chat.participant, isOnline } }
        : chat
    );

    // Update current chat
    const updatedCurrentChat =
      currentChat && currentChat.participant._id === userId
        ? {
            ...currentChat,
            participant: { ...currentChat.participant, isOnline },
          }
        : currentChat;

    set({
      chats: updatedChats,
      currentChat: updatedCurrentChat,
      onlineUsers: newOnlineUsers,
    });
  },

  setUserTyping: (userId: string, isTyping: boolean) => {
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [userId]: isTyping,
      },
    }));
  },

  setOnlineUsers: (userIds: string[]) => {
    set({ onlineUsers: new Set(userIds) });
  },

  fetchChats: async () => {
    try {
      set({ loading: true });
      const response = await chatAPI.getChats();
      set({ chats: response.data.chats });
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    } finally {
      set({ loading: false });
    }
  },

  fetchMessages: async (userId: string) => {
    try {
      set({ loading: true });
      const response = await chatAPI.getChatHistory(userId);
      set({ messages: response.data.messages });
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      set({ loading: false });
    }
  },

  sendMessage: async (receiverId: string, content: string) => {
    // This will be handled by socket now
    // The socket service will emit the message
  },

  searchUsers: async (query = ''): Promise<User[]> => {
    try {
      const response = await chatAPI.searchUsers(query);
      return response.data.users;
    } catch (error) {
      console.error('Failed to search users:', error);
      return [];
    }
  },
}));
