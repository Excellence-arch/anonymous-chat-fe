export interface User {
  _id: string
  username: string
  avatar: string
  lastSeen?: Date
}

export interface IUser {
  _id: string
  username: string
  email: string
  avatar: string
  lastSeen?: Date
}

export interface Message {
  _id: string
  senderId: User
  receiverId: User
  content: string
  timestamp: Date
  isRead: boolean
}

export interface Chat {
  chatId: string
  participant: User
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (identifier: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
}

export interface ChatState {
  chats: Chat[]
  currentChat: Chat | null
  messages: Message[]
  loading: boolean
  setCurrentChat: (chat: Chat | null) => void
  fetchChats: () => Promise<void>
  fetchMessages: (userId: string) => Promise<void>
  sendMessage: (receiverId: string, content: string) => Promise<void>
  searchUsers: (query: string) => Promise<User[]>
}
