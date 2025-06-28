"use client"

import type React from "react"
import { useAuthStore } from "../../store/authStore"
import { useThemeStore } from "../../store/themeStore"
import { Moon, Sun, LogOut, MessageCircle } from "lucide-react"
import { motion } from "framer-motion"

const Header: React.FC = () => {
  const { user, logout } = useAuthStore()
  const { isDark, toggleTheme } = useThemeStore()

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`h-16 border-b transition-colors duration-200 ${
        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <div className="h-full px-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <MessageCircle className={`w-8 h-8 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
          <h1 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Anonymous Chat</h1>
        </div>

        <div className="flex items-center space-x-4">
          {user && (
            <div className="flex items-center space-x-3">
              <img src={user.avatar || "/placeholder.svg"} alt={user.username} className="w-8 h-8 rounded-full" />
              <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{user.username}</span>
            </div>
          )}

          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-600"
            }`}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {user && (
            <button
              onClick={logout}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </motion.header>
  )
}

export default Header
