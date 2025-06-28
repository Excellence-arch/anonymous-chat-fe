"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useChatStore } from "../../store/chatStore"
import { useThemeStore } from "../../store/themeStore"
import { Search, X } from "lucide-react"
import type { User } from "../../types"

interface UserSearchModalProps {
  isOpen: boolean
  onClose: () => void
}

const UserSearchModal: React.FC<UserSearchModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const { searchUsers, setCurrentChat, fetchChats } = useChatStore()
  const { isDark } = useThemeStore()

  useEffect(() => {
    const searchUsersDebounced = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([])
        return
      }

      setLoading(true)
      try {
        const users = await searchUsers(searchQuery.trim())
        setSearchResults(users)
      } catch (error) {
        console.error("Search error:", error)
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(searchUsersDebounced, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery, searchUsers])

  const handleUserSelect = (user: User) => {
    const newChat = {
      chatId: `temp-${user._id}`,
      participant: user,
      lastMessage: "",
      lastMessageTime: new Date(),
      unreadCount: 0,
    }

    setCurrentChat(newChat)
    fetchChats() // Refresh chats to get the actual chat if it exists
    onClose()
  }

  const handleClose = () => {
    setSearchQuery("")
    setSearchResults([])
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`relative w-full max-w-md rounded-2xl shadow-xl ${isDark ? "bg-gray-800" : "bg-white"}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Find Users</h3>
              <button
                onClick={handleClose}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-500"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-6">
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
                  placeholder="Search by username..."
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors ${
                    isDark
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  autoFocus
                />
              </div>
            </div>

            {/* Search Results */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div
                    className={`w-6 h-6 border-2 border-t-transparent rounded-full animate-spin ${
                      isDark ? "border-gray-400" : "border-gray-600"
                    }`}
                  />
                </div>
              ) : searchQuery.trim().length < 2 ? (
                <div className="text-center py-8">
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Type at least 2 characters to search
                  </p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-8">
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>No users found</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {searchResults.map((user) => (
                    <motion.div
                      key={user._id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleUserSelect(user)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        isDark ? "hover:bg-gray-700" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={user.avatar || "/placeholder.svg"}
                          alt={user.username}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <h4 className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{user.username}</h4>
                          <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Anonymous user</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default UserSearchModal
