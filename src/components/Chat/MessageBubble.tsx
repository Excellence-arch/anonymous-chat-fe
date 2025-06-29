'use client';

import type React from 'react';
import { motion } from 'framer-motion';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import type { Message } from '../../types';
import { Check, CheckCheck, Clock } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  showAvatar: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  showAvatar,
}) => {
  const { isDark } = useThemeStore();
  const { user } = useAuthStore();

  // Determine if this message is from the current user
  const isOwn = message.senderId._id === user?._id;
  const isOptimistic = message._id.startsWith('temp-');

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex items-end space-x-2 ${
        isOwn ? 'justify-end' : 'justify-start'
      }`}
    >
      {/* Avatar for received messages (left side) */}
      {!isOwn && showAvatar && (
        <img
          src={message.senderId.avatar || '/placeholder.svg'}
          alt={message.senderId.username}
          className="w-8 h-8 rounded-full flex-shrink-0"
        />
      )}

      {/* Spacer when avatar is not shown */}
      {!isOwn && !showAvatar && <div className="w-8 flex-shrink-0" />}

      {/* Message content */}
      <div
        className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl`}
      >
        <div
          className={`px-4 py-2 rounded-2xl break-words ${
            isOwn
              ? `bg-blue-600 text-white rounded-br-md ml-auto ${
                  isOptimistic ? 'opacity-70' : ''
                }`
              : isDark
              ? 'bg-gray-700 text-white rounded-bl-md'
              : 'bg-gray-200 text-gray-900 rounded-bl-md'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Message metadata */}
        <div
          className={`flex items-center mt-1 space-x-1 ${
            isOwn ? 'justify-end' : 'justify-start'
          }`}
        >
          <span
            className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
          >
            {formatTime(message.timestamp)}
          </span>
          {isOwn && (
            <div className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {isOptimistic ? (
                <Clock className="w-3 h-3" />
              ) : message.isRead ? (
                <CheckCheck className="w-3 h-3 text-blue-500" />
              ) : (
                <Check className="w-3 h-3" />
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
