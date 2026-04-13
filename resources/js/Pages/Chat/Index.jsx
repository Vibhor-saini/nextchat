import React, { useState, useCallback, memo } from "react";
import useChat from "@/utils/useChat";
import Sidebar from "@/components/chat/Sidebar";
import ChatWindow from "@/components/chat/ChatWindow";

// Memoized so Sidebar never re-renders just because showChat toggles
const MemoSidebar = memo(Sidebar);

// Memoized so ChatWindow never re-renders just because sidebar state changes
const MemoChatWindow = memo(ChatWindow);

export default function Chat() {
  const {
    users,
    authUser,
    selectedUser,
    filteredMessages,
    handleSelectUser,
    handleSend,
    isLoading,
    sendTyping,
    typing,
  } = useChat("/chat");

  const [showChat, setShowChat] = useState(false);

  const handleUserClick = useCallback((user) => {
    handleSelectUser(user);
    setShowChat(true);
  }, [handleSelectUser]);

  const handleBack = useCallback(() => {setShowChat(false); handleSelectUser(null); }, []);

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar — hidden on mobile when chat is open */}
      <div className={`${showChat ? "hidden md:flex" : "flex"} w-full md:w-auto`}>
        <MemoSidebar
          users={users}
          onSelectUser={handleUserClick}
          selectedUserId={selectedUser?.id}
          currentUserId={authUser.id}
          sendTyping={sendTyping}
          typing={typing}
        />
      </div>

      {/* Chat window — hidden on mobile when sidebar is shown */}
      <div className={`${showChat ? "flex" : "hidden md:flex"} flex-1`}>
        <MemoChatWindow
          messages={filteredMessages}
          selectedUser={selectedUser}
          onSend={handleSend}
          currentUserId={authUser.id}
          onBack={handleBack}
          isLoading={isLoading}
          sendTyping={sendTyping}
          typing={typing}
        />
      </div>
    </div>
  );
}