'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../../store/chatStore';
import { useThemeStore } from '../../store/themeStore';
import { Search, X } from 'lucide-react';
import OnlineIndicator from './OnlineIndicator';
import type { User } from '../../types';

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserSearchModal: React.FC<UserSearchModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { searchUsers, setCurrentChat, fetchChats } = useChatStore();
  const { isDark } = useThemeStore();

  // Load all users when modal opens
  useEffect(() => {
    if (isOpen) {
      loadAllUsers();
    }
  }, [isOpen]);

  const loadAllUsers = async () => {
    setLoading(true);
    try {
      const users = await searchUsers(''); // Empty query returns all users
      setAllUsers(users);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = allUsers.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort users: online first, then by username
  const sortedUsers = filteredUsers.sort((a, b) => {
    if (a.isOnline && !b.isOnline) return -1;
    if (!a.isOnline && b.isOnline) return 1;
    return a.username.localeCompare(b.username);
  });

  const handleUserSelect = (user: User) => {
    const newChat = {
      chatId: `temp-${user._id}`,
      participant: user,
      lastMessage: '',
      lastMessageTime: new Date(),
      unreadCount: 0,
    };

    setCurrentChat(newChat);
    fetchChats(); // Refresh chats to get the actual chat if it exists
    onClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    setAllUsers([]);
    onClose();
  };

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
            className={`relative w-full max-w-md rounded-2xl shadow-xl ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3
                className={`text-lg font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
              >
                Start New Chat
              </h3>
              <button
                onClick={handleClose}
                className={`p-2 rounded-lg transition-colors ${
                  isDark
                    ? 'hover:bg-gray-700 text-gray-400'
                    : 'hover:bg-gray-100 text-gray-500'
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
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  autoFocus
                />
              </div>
            </div>

            {/* User List */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div
                    className={`w-6 h-6 border-2 border-t-transparent rounded-full animate-spin ${
                      isDark ? 'border-gray-400' : 'border-gray-600'
                    }`}
                  />
                </div>
              ) : sortedUsers.length === 0 ? (
                <div className="text-center py-8">
                  <p
                    className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    {searchQuery ? 'No users found' : 'No users available'}
                  </p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {sortedUsers.map((user) => (
                    <motion.div
                      key={user._id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleUserSelect(user)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <img
                            src={user.avatar || '/placeholder.svg'}
                            alt={user.username}
                            className="w-10 h-10 rounded-full"
                          />
                          <div className="absolute -bottom-1 -right-1">
                            <OnlineIndicator
                              isOnline={user.isOnline}
                              size="sm"
                            />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4
                              className={`font-medium ${
                                isDark ? 'text-white' : 'text-gray-900'
                              }`}
                            >
                              {user.username}
                            </h4>
                            {user.isOnline && (
                              <span className="text-xs text-green-500 font-medium">
                                Online
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-sm ${
                              isDark ? 'text-gray-400' : 'text-gray-500'
                            }`}
                          >
                            Anonymous user
                          </p>
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
  );
};

export default UserSearchModal;
