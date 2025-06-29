'use client';

import type React from 'react';
import { useEffect } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useResponsive } from '../../hooks/useResponsive';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';

const ChatPage: React.FC = () => {
  const { showChatList, setShowChatList, currentChat } = useChatStore();
  const { isMobile } = useResponsive();

  useEffect(() => {
    // On mobile, show chat list by default when no chat is selected
    if (isMobile && !currentChat) {
      setShowChatList(true);
    }
    // On desktop, always show chat list
    if (!isMobile) {
      setShowChatList(true);
    }
  }, [isMobile, currentChat, setShowChatList]);

  return (
    <div className="h-full flex overflow-hidden">
      {/* Chat List - Responsive visibility */}
      <div
        className={`
          ${isMobile ? (showChatList ? 'flex' : 'hidden') : 'flex'}
          ${isMobile ? 'w-full' : 'w-80'}
          flex-shrink-0
        `}
      >
        <ChatList />
      </div>

      {/* Chat Window - Responsive visibility */}
      <div
        className={`
          ${isMobile ? (showChatList ? 'hidden' : 'flex') : 'flex'}
          flex-1
          min-w-0
        `}
      >
        <ChatWindow />
      </div>
    </div>
  );
};

export default ChatPage;
