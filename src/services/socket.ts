import { io, type Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import type { Message } from '../types';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect() {
    const token = useAuthStore.getState().token;
    if (!token) return;

    this.socket = io(
      process.env.REACT_APP_API_URL?.replace('/api', '') ||
        'http://localhost:5000',
      {
        auth: {
          token,
        },
        transports: ['websocket', 'polling'],
      }
    );

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => this.connect(), 1000 * this.reconnectAttempts);
      }
    });

    // Chat events
    this.socket.on('new_message', (message: Message) => {
      useChatStore.getState().addMessage(message);
    });

    this.socket.on('chat_updated', () => {
      // Only refresh chats if we're not in an active conversation
      // to avoid disrupting the current chat experience
      const { currentChat } = useChatStore.getState();
      if (!currentChat) {
        useChatStore.getState().fetchChats();
      }
    });

    this.socket.on('messages_read', (data: { readBy: string }) => {
      useChatStore.getState().markMessagesAsRead(data.readBy);
    });

    // User status events
    this.socket.on(
      'user_online',
      (data: { userId: string; username: string; isOnline: boolean }) => {
        useChatStore.getState().updateUserStatus(data.userId, true);
      }
    );

    this.socket.on(
      'user_offline',
      (data: { userId: string; username: string; isOnline: boolean }) => {
        useChatStore.getState().updateUserStatus(data.userId, false);
      }
    );

    // Typing events
    this.socket.on(
      'user_typing',
      (data: { userId: string; username: string; isTyping: boolean }) => {
        useChatStore.getState().setUserTyping(data.userId, data.isTyping);
      }
    );

    this.socket.on('error', (error: { message: string }) => {
      console.error('Socket error:', error.message);
      // Handle message send failures by removing optimistic messages
      this.handleMessageError();
    });
  }

  private handleMessageError() {
    // Remove the most recent optimistic message on error
    const { messages } = useChatStore.getState();
    const lastMessage = messages[messages.length - 1];

    if (lastMessage && lastMessage._id.startsWith('temp-')) {
      const updatedMessages = messages.slice(0, -1);
      useChatStore.setState({ messages: updatedMessages });
    }
  }

  sendMessage(receiverId: string, content: string) {
    if (this.socket) {
      const { user } = useAuthStore.getState();
      const { currentChat } = useChatStore.getState();

      if (!user || !currentChat) return;

      // Add optimistic message immediately
      useChatStore.getState().addOptimisticMessage({
        senderId: {
          _id: user._id,
          username: user.username,
          avatar: user.avatar,
        },
        receiverId: {
          _id: currentChat.participant._id,
          username: currentChat.participant.username,
          avatar: currentChat.participant.avatar,
        },
        content,
      });

      // Send via socket
      this.socket.emit('send_message', { receiverId, content });
    }
  }

  markMessagesRead(senderId: string) {
    if (this.socket) {
      this.socket.emit('mark_messages_read', { senderId });
    }
  }

  startTyping(receiverId: string) {
    if (this.socket) {
      this.socket.emit('typing_start', { receiverId });
    }
  }

  stopTyping(receiverId: string) {
    if (this.socket) {
      this.socket.emit('typing_stop', { receiverId });
    }
  }

  joinChat(chatId: string) {
    if (this.socket) {
      this.socket.emit('join_chat', chatId);
    }
  }

  leaveChat(chatId: string) {
    if (this.socket) {
      this.socket.emit('leave_chat', chatId);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
