'use client';

import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import MessageBubble from './MessageBubble';

const ChatWindow: React.FC = () => {
  const { currentChat, messages, fetchMessages, sendMessage, loading } =
    useChatStore();
  const { user } = useAuthStore();
  const { isDark } = useThemeStore();
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentChat) {
      // console.log(currentChat)
      fetchMessages(currentChat.participant._id);
    }
  }, [currentChat, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !currentChat || sending) return;

    setSending(true);
    try {
      await sendMessage(currentChat.participant._id, messageText.trim());
      setMessageText('');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSending(false);
    }
  };

  if (!currentChat) {
    return (
      <div
        className={`flex-1 flex items-center justify-center ${
          isDark ? 'bg-gray-900' : 'bg-gray-50'
        }`}
      >
        <div className="text-center">
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

  return (
    <div
      className={`flex-1 flex flex-col ${isDark ? 'bg-gray-900' : 'bg-white'}`}
    >
      {/* Chat Header */}
      <div
        className={`p-4 border-b flex items-center space-x-3 ${
          isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        }`}
      >
        <img
          src={currentChat.participant.avatar || '/placeholder.svg'}
          alt={currentChat.participant.username}
          className="w-10 h-10 rounded-full"
        />
        <div>
          <h3
            className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            {currentChat.participant.username}
          </h3>
          <p
            className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
          >
            Anonymous user
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
            {messages.map((message, index) => (
              <MessageBubble
                key={message._id}
                message={message}
                isOwn={message.senderId._id === user?._id}
                showAvatar={
                  index === 0 ||
                  messages[index - 1].senderId._id !== message.senderId._id
                }
              />
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div
        className={`p-4 border-t ${
          isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        }`}
      >
        <form
          onSubmit={handleSendMessage}
          className="flex items-end space-x-3"
        >
          <div className="flex-1">
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message..."
              rows={1}
              className={`w-full px-4 py-3 rounded-2xl border resize-none transition-colors ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
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
            disabled={!messageText.trim() || sending}
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
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
