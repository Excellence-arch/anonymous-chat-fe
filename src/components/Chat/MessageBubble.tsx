"use client"

import type React from "react"
import { motion } from "framer-motion"
import { useThemeStore } from "../../store/themeStore"
import type { Message } from "../../types"
import { Check, CheckCheck } from "lucide-react"

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  showAvatar: boolean
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn, showAvatar }) => {
  const { isDark } = useThemeStore()

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex items-end space-x-2 ${isOwn ? "justify-end" : "justify-start"}`}
    >
      {!isOwn && showAvatar && (
        <img
          src={message.senderId.avatar || "/placeholder.svg"}
          alt={message.senderId.username}
          className="w-8 h-8 rounded-full"
        />
      )}

      {!isOwn && !showAvatar && <div className="w-8" />}

      <div className={`max-w-xs lg:max-w-md ${isOwn ? "order-1" : "order-2"}`}>
        <div
          className={`px-4 py-2 rounded-2xl ${
            isOwn
              ? "bg-blue-600 text-white rounded-br-md"
              : isDark
                ? "bg-gray-700 text-white rounded-bl-md"
                : "bg-gray-200 text-gray-900 rounded-bl-md"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>

        <div className={`flex items-center mt-1 space-x-1 ${isOwn ? "justify-end" : "justify-start"}`}>
          <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            {formatTime(message.timestamp)}
          </span>
          {isOwn && (
            <div className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>
              {message.isRead ? <CheckCheck className="w-3 h-3 text-blue-500" /> : <Check className="w-3 h-3" />}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default MessageBubble
