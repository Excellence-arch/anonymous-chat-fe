import type React from "react"
import ChatList from "./ChatList"
import ChatWindow from "./ChatWindow"

const ChatPage: React.FC = () => {
  return (
    <div className="h-full flex">
      <ChatList />
      <ChatWindow />
    </div>
  )
}

export default ChatPage
