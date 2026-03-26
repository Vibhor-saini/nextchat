import React from "react";
import useChat from "@/utils/useChat";
import Sidebar from "@/components/chat/Sidebar";
import ChatWindow from "@/components/chat/ChatWindow";

export default function Chat() {
  const { users, authUser, selectedUser, filteredMessages, handleSelectUser, handleSend } = useChat('/chat');

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar
        users={users}
        onSelectUser={handleSelectUser}
        selectedUserId={selectedUser?.id}
      />
      <ChatWindow
        messages={filteredMessages}
        selectedUser={selectedUser}
        onSend={handleSend}
        currentUserId={authUser.id}
      />
    </div>
  );
}