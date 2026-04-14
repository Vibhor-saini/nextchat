import React, { useState, useCallback, memo } from "react";
import useChat from "@/utils/useChat";
import Sidebar from "@/components/chat/Sidebar";
import ChatWindow from "@/components/chat/ChatWindow";

const MemoSidebar   = memo(Sidebar);
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
    historyKey,       // ← new
  } = useChat("/chat");

  const [showChat, setShowChat] = useState(false);

  const handleUserClick = useCallback((user) => {
    handleSelectUser(user);
    setShowChat(true);
  }, [handleSelectUser]);

  const handleBack = useCallback(() => {
    setShowChat(false);
    handleSelectUser(null);
  }, [handleSelectUser]);

  return (
    <div className="flex h-screen bg-white overflow-hidden">
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
          authUser={authUser}       // ← new: full object for userMap
          users={users}             // ← new: full list for reaction tooltips
          historyKey={historyKey}   // ← new: drives hard scroll-to-bottom
        />
      </div>
    </div>
  );
}