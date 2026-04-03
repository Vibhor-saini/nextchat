import React, { useState } from "react";
import useChat from "@/utils/useChat";
import Sidebar from "@/components/chat/Sidebar";
import ChatWindow from "@/components/chat/ChatWindow";

export default function Chat() {
  const { users, authUser, selectedUser, filteredMessages, handleSelectUser, handleSend } = useChat('/chat');
  const [showChat, setShowChat] = useState(false);

  const handleUserClick = (user) => {
    handleSelectUser(user);
    setShowChat(true);
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">

      <div className={`${showChat ? 'hidden md:flex' : 'flex'} w-full md:w-auto`}>
        <Sidebar
          users={users}
          onSelectUser={handleUserClick}
          selectedUserId={selectedUser?.id}
        />
      </div>

      <div className={`${showChat ? 'flex' : 'hidden md:flex'} flex-1`}>
        <ChatWindow
          messages={filteredMessages}
          selectedUser={selectedUser}
          onSend={handleSend}
          currentUserId={authUser.id}
          onBack={() => setShowChat(false)}
        />
      </div>
    </div>
  );
}