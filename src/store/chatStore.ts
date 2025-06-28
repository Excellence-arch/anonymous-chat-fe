import { create } from "zustand"
import type { ChatState, Chat, User } from "../types"
import { chatAPI } from "../services/api"

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  currentChat: null,
  messages: [],
  loading: false,

  setCurrentChat: (chat: Chat | null) => {
    set({ currentChat: chat, messages: [] })
  },

  fetchChats: async () => {
    try {
      set({ loading: true })
      const response = await chatAPI.getChats()
      set({ chats: response.data.chats })
    } catch (error) {
      console.error("Failed to fetch chats:", error)
    } finally {
      set({ loading: false })
    }
  },

  fetchMessages: async (userId: string) => {
    try {
      set({ loading: true })
      const response = await chatAPI.getChatHistory(userId)
      set({ messages: response.data.messages })
    } catch (error) {
      console.error("Failed to fetch messages:", error)
    } finally {
      set({ loading: false })
    }
  },

  sendMessage: async (receiverId: string, content: string) => {
    try {
      const response = await chatAPI.sendMessage(receiverId, content)
      const newMessage = response.data.data

      set((state) => ({
        messages: [...state.messages, newMessage],
      }))

      // Refresh chats to update last message
      get().fetchChats()
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to send message")
    }
  },

  searchUsers: async (query: string): Promise<User[]> => {
    try {
      const response = await chatAPI.searchUsers(query)
      return response.data.users
    } catch (error) {
      console.error("Failed to search users:", error)
      return []
    }
  },
}))
