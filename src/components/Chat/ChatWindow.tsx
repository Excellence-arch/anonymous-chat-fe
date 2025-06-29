'use client';

import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useResponsive } from '../../hooks/useResponsive';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft } from 'lucide-react';
import { socketService } from '../../services/socket';
import MessageBubble from './MessageBubble';
import OnlineIndicator from './OnlineIndicator';

const ChatWindow: React.FC = () => {
  const {
    currentChat,
    messages,
    fetchMessages,
    loading,
    setShowChatList,
    typingUsers,
    onlineUsers,
  } = useChatStore();
  const { user } = useAuthStore();
  const { isDark } = useThemeStore();
  const { isMobile } = useResponsive();
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (currentChat) {
      fetchMessages(currentChat.participant._id);
      socketService.markMessagesRead(currentChat.participant._id);

      // Auto-focus on input when chat is selected
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [currentChat, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBackClick = () => {
    setShowChatList(true);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !currentChat || isSending) return;

    const messageContent = messageText.trim();

    // Clear input immediately for better UX
    setMessageText('');
    setIsSending(true);

    try {
      // Send message via socket (this will add optimistic message)
      socketService.sendMessage(currentChat.participant._id, messageContent);

      // Stop typing indicator
      if (isTyping) {
        socketService.stopTyping(currentChat.participant._id);
        setIsTyping(false);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Restore message text on error
      setMessageText(messageContent);
    } finally {
      setIsSending(false);
      // Keep focus on input
      inputRef.current?.focus();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);

    if (!currentChat) return;

    // Handle typing indicators
    if (e.target.value.trim() && !isTyping) {
      setIsTyping(true);
      socketService.startTyping(currentChat.participant._id);
    } else if (!e.target.value.trim() && isTyping) {
      setIsTyping(false);
      socketService.stopTyping(currentChat.participant._id);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    if (e.target.value.trim()) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        socketService.stopTyping(currentChat.participant._id);
      }, 2000);
    }
  };

  if (!currentChat) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center ${
          isDark ? 'bg-gray-900' : 'bg-gray-50'
        }`}
      >
        <div className="text-center px-4">
          <div
            className={`text-6xl mb-4 ${
              isDark ? 'text-gray-600' : 'text-gray-300'
            }`}
          >
            💬
          </div>
          <h3
            className={`text-xl font-medium mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            Select a chat to start messaging
          </h3>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Choose a conversation from the sidebar or start a new one
          </p>
        </div>
      </div>
    );
  }

  const isUserTyping = typingUsers[currentChat.participant._id];
  const isOnline =
    onlineUsers.has(currentChat.participant._id) ||
    currentChat.participant.isOnline;

  return (
    <div className="w-full h-full flex flex-col">
      {/* Chat Header */}
      <div
        className={`p-4 border-b flex items-center space-x-3 flex-shrink-0 ${
          isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        }`}
      >
        {/* Back button for mobile */}
        {isMobile && (
          <button
            onClick={handleBackClick}
            className={`p-2 rounded-lg transition-colors ${
              isDark
                ? 'hover:bg-gray-700 text-gray-300'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        <div className="relative">
          <img
            src={currentChat.participant.avatar || '/placeholder.svg'}
            alt={currentChat.participant.username}
            className="w-10 h-10 rounded-full"
          />
          <div className="absolute -bottom-1 -right-1">
            <OnlineIndicator
              isOnline={isOnline}
              size="sm"
            />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className={`font-medium truncate ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            {currentChat.participant.username}
          </h3>
          <p
            className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
          >
            {isOnline ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div
              className={`w-6 h-6 border-2 border-t-transparent rounded-full animate-spin ${
                isDark ? 'border-gray-400' : 'border-gray-600'
              }`}
            />
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message, index) => {
              // Check if we should show avatar (first message or different sender from previous)
              const showAvatar =
                index === 0 ||
                messages[index - 1].senderId._id !== message.senderId._id;

              return (
                <MessageBubble
                  key={message._id}
                  message={message}
                  showAvatar={showAvatar}
                />
              );
            })}
          </AnimatePresence>
        )}

        {/* Typing indicator */}
        {isUserTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-end space-x-2"
          >
            <img
              src={currentChat.participant.avatar || '/placeholder.svg'}
              alt={currentChat.participant.username}
              className="w-8 h-8 rounded-full flex-shrink-0"
            />
            <div
              className={`px-4 py-2 rounded-2xl rounded-bl-md ${
                isDark ? 'bg-gray-700' : 'bg-gray-200'
              }`}
            >
              <div className="flex space-x-1">
                <div
                  className={`w-2 h-2 rounded-full animate-bounce ${
                    isDark ? 'bg-gray-400' : 'bg-gray-500'
                  }`}
                  style={{ animationDelay: '0ms' }}
                />
                <div
                  className={`w-2 h-2 rounded-full animate-bounce ${
                    isDark ? 'bg-gray-400' : 'bg-gray-500'
                  }`}
                  style={{ animationDelay: '150ms' }}
                />
                <div
                  className={`w-2 h-2 rounded-full animate-bounce ${
                    isDark ? 'bg-gray-400' : 'bg-gray-500'
                  }`}
                  style={{ animationDelay: '300ms' }}
                />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div
        className={`p-4 border-t flex-shrink-0 ${
          isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        }`}
      >
        <form
          onSubmit={handleSendMessage}
          className="flex items-end space-x-3"
        >
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={messageText}
              onChange={handleInputChange}
              placeholder="Type a message..."
              rows={1}
              disabled={isSending}
              className={`w-full px-4 py-3 rounded-2xl border resize-none transition-colors ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!messageText.trim() || isSending}
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            {isSending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
