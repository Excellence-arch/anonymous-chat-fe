"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { useChatStore } from "../../store/chatStore"
import { useAuthStore } from "../../store/authStore"
import { useThemeStore } from "../../store/themeStore"
import { motion, AnimatePresence } from "framer-motion"
import { Send, ArrowLeft } from "lucide-react"
import { socketService } from "../../services/socket"
import MessageBubble from "./MessageBubble"
import OnlineIndicator from "./OnlineIndicator"

const ChatWindow: React.FC = () => {
  const { currentChat, messages, fetchMessages, loading, showChatList, setShowChatList, typingUsers } = useChatStore()
  const { user } = useAuthStore()
  const { isDark } = useThemeStore()
  const [messageText, setMessageText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (currentChat) {
      fetchMessages(currentChat.participant._id)
      socketService.markMessagesRead(currentChat.participant._id)
    }
  }, [currentChat, fetchMessages])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleBackClick = () => {
    setShowChatList(true)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim() || !currentChat) return

    // Send message via socket
    socketService.sendMessage(currentChat.participant._id, messageText.trim())
    setMessageText("")

    // Stop typing indicator
    if (isTyping) {
      socketService.stopTyping(currentChat.participant._id)
      setIsTyping(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value)

    if (!currentChat) return

    // Handle typing indicators
    if (e.target.value.trim() && !isTyping) {
      setIsTyping(true)
      socketService.startTyping(currentChat.participant._id)
    } else if (!e.target.value.trim() && isTyping) {
      setIsTyping(false)
      socketService.stopTyping(currentChat.participant._id)
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing indicator
    if (e.target.value.trim()) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false)
        socketService.stopTyping(currentChat.participant._id)
      }, 2000)
    }
  }

  if (!currentChat) {
    return (
      <div className={`flex-1 flex items-center justify-center ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className="text-center">
          <div className={`text-6xl mb-4 ${isDark ? "text-gray-600" : "text-gray-300"}`}>💬</div>
          <h3 className={`text-xl font-medium mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
            Select a chat to start messaging
          </h3>
          <p className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Choose a conversation from the sidebar or start a new one
          </p>
        </div>
      </div>
    )
  }

  const isUserTyping = typingUsers[currentChat.participant._id]

  return (
    <div
      className={`
      ${showChatList ? "hidden" : "flex"} 
      md:flex 
      flex-1 
      flex-col 
      ${isDark ? "bg-gray-900" : "bg-white"}
    `}
    >
      {/* Chat Header */}
      <div
        className={`p-4 border-b flex items-center space-x-3 ${
          isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
        }`}
      >
        {/* Back button for mobile */}
        <button
          onClick={handleBackClick}
          className={`md:hidden p-2 rounded-lg transition-colors ${
            isDark ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-600"
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="relative">
          <img
            src={currentChat.participant.avatar || "/placeholder.svg"}
            alt={currentChat.participant.username}
            className="w-10 h-10 rounded-full"
          />
          <div className="absolute -bottom-1 -right-1">
            <OnlineIndicator isOnline={currentChat.participant.isOnline} size="sm" />
          </div>
        </div>

        <div className="flex-1">
          <h3 className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
            {currentChat.participant.username}
          </h3>
          <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            {currentChat.participant.isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div
              className={`w-6 h-6 border-2 border-t-transparent rounded-full animate-spin ${
                isDark ? "border-gray-400" : "border-gray-600"
              }`}
            />
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message, index) => (
              <MessageBubble
                key={message._id}
                message={message}
                isOwn={message.senderId._id === user?._id}
                showAvatar={index === 0 || messages[index - 1].senderId._id !== message.senderId._id}
              />
            ))}
          </AnimatePresence>
        )}

        {/* Typing indicator */}
        {isUserTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center space-x-2"
          >
            <img
              src={currentChat.participant.avatar || "/placeholder.svg"}
              alt={currentChat.participant.username}
              className="w-8 h-8 rounded-full"
            />
            <div className={`px-4 py-2 rounded-2xl ${isDark ? "bg-gray-700" : "bg-gray-200"}`}>
              <div className="flex space-x-1">
                <div
                  className={`w-2 h-2 rounded-full animate-bounce ${isDark ? "bg-gray-400" : "bg-gray-500"}`}
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className={`w-2 h-2 rounded-full animate-bounce ${isDark ? "bg-gray-400" : "bg-gray-500"}`}
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className={`w-2 h-2 rounded-full animate-bounce ${isDark ? "bg-gray-400" : "bg-gray-500"}`}
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className={`p-4 border-t ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}>
        <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              value={messageText}
              onChange={handleInputChange}
              placeholder="Type a message..."
              rows={1}
              className={`w-full px-4 py-3 rounded-2xl border resize-none transition-colors ${
                isDark
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                  : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage(e)
                }
              }}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!messageText.trim()}
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </form>
      </div>
    </div>
  )
}

export default ChatWindow
