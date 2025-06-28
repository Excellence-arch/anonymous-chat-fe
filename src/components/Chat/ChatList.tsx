"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useChatStore } from "../../store/chatStore"
import { useThemeStore } from "../../store/themeStore"
import { motion } from "framer-motion"
import { Search, Plus } from "lucide-react"
import UserSearchModal from "./UserSearchModal"

const ChatList: React.FC = () => {
  const { chats, currentChat, setCurrentChat, fetchChats, loading } = useChatStore()
  const { isDark } = useThemeStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [showUserSearch, setShowUserSearch] = useState(false)

  useEffect(() => {
    fetchChats()
  }, [fetchChats])

  const filteredChats = chats.filter((chat) =>
    chat.participant.username.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatTime = (date: Date) => {
    const now = new Date()
    const messageDate = new Date(date)
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else {
      return messageDate.toLocaleDateString()
    }
  }

  return (
    <div
      className={`w-80 border-r flex flex-col ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Chats</h2>
          <button
            onClick={() => setShowUserSearch(true)}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-600"
            }`}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats..."
            className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
              isDark
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
            } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div
              className={`w-6 h-6 border-2 border-t-transparent rounded-full animate-spin ${
                isDark ? "border-gray-400" : "border-gray-600"
              }`}
            />
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center px-4">
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              {searchQuery ? "No chats found" : "No chats yet"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowUserSearch(true)}
                className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Start a new chat
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredChats.map((chat) => (
              <motion.div
                key={chat.chatId}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentChat(chat)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  currentChat?.chatId === chat.chatId
                    ? isDark
                      ? "bg-blue-600/20 border border-blue-500/30"
                      : "bg-blue-50 border border-blue-200"
                    : isDark
                      ? "hover:bg-gray-700"
                      : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={chat.participant.avatar || "/placeholder.svg"}
                      alt={chat.participant.username}
                      className="w-12 h-12 rounded-full"
                    />
                    {chat.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {chat.unreadCount > 9 ? "9+" : chat.unreadCount}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-medium truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                        {chat.participant.username}
                      </h3>
                      <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        {formatTime(chat.lastMessageTime)}
                      </span>
                    </div>
                    <p
                      className={`text-sm truncate ${
                        chat.unreadCount > 0
                          ? isDark
                            ? "text-white"
                            : "text-gray-900"
                          : isDark
                            ? "text-gray-400"
                            : "text-gray-500"
                      }`}
                    >
                      {chat.lastMessage || "No messages yet"}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* User Search Modal */}
      <UserSearchModal isOpen={showUserSearch} onClose={() => setShowUserSearch(false)} />
    </div>
  )
}

export default ChatList
