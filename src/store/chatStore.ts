import { create } from 'zustand';
import type { ChatState, Chat, User, Message } from '../types';
import { chatAPI } from '../services/api';

interface ExtendedChatState extends ChatState {
  showChatList: boolean;
  typingUsers: Record<string, boolean>;
  onlineUsers: Set<string>;
  setShowChatList: (show: boolean) => void;
  addMessage: (message: Message) => void;
  addOptimisticMessage: (message: Partial<Message>) => void;
  markMessagesAsRead: (userId: string) => void;
  updateUserStatus: (userId: string, isOnline: boolean) => void;
  setUserTyping: (userId: string, isTyping: boolean) => void;
  setOnlineUsers: (userIds: string[]) => void;
  updateChatLastMessage: (
    participantId: string,
    message: string,
    timestamp: Date
  ) => void;
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

  addOptimisticMessage: (messageData: Partial<Message>) => {
    const { messages, currentChat } = get();

    if (!currentChat || !messageData.content) return;

    // Create optimistic message
    const optimisticMessage: Message = {
      _id: `temp-${Date.now()}`, // Temporary ID
      senderId: messageData.senderId!,
      receiverId: messageData.receiverId!,
      content: messageData.content,
      timestamp: new Date(),
      isRead: false,
    };

    // Add to messages immediately
    set({ messages: [...messages, optimisticMessage] });

    // Update chat list immediately
    get().updateChatLastMessage(
      currentChat.participant._id,
      messageData.content,
      new Date()
    );
  },

  addMessage: (message: Message) => {
    const { currentChat, messages } = get();

    // Only add message if it's for the current chat
    if (
      currentChat &&
      (message.senderId._id === currentChat.participant._id ||
        message.receiverId._id === currentChat.participant._id)
    ) {
      // Check if this is replacing an optimistic message
      const existingOptimisticIndex = messages.findIndex(
        (msg) =>
          msg._id.startsWith('temp-') &&
          msg.content === message.content &&
          Math.abs(
            new Date(msg.timestamp).getTime() -
              new Date(message.timestamp).getTime()
          ) < 5000 // Within 5 seconds
      );

      if (existingOptimisticIndex !== -1) {
        // Replace optimistic message with real message
        const updatedMessages = [...messages];
        updatedMessages[existingOptimisticIndex] = message;
        set({ messages: updatedMessages });
      } else {
        // Add new message (from other user)
        set({ messages: [...messages, message] });
      }

      // Update chat list
      get().updateChatLastMessage(
        message.senderId._id === currentChat.participant._id
          ? message.senderId._id
          : message.receiverId._id,
        message.content,
        message.timestamp
      );
    }
  },

  updateChatLastMessage: (
    participantId: string,
    message: string,
    timestamp: Date
  ) => {
    const { chats } = get();

    const updatedChats = chats.map((chat) => {
      if (chat.participant._id === participantId) {
        return {
          ...chat,
          lastMessage: message,
          lastMessageTime: timestamp,
        };
      }
      return chat;
    });

    // Sort chats by last message time
    updatedChats.sort(
      (a, b) =>
        new Date(b.lastMessageTime).getTime() -
        new Date(a.lastMessageTime).getTime()
    );

    set({ chats: updatedChats });
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
    // This will be handled by socket now with optimistic updates
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
