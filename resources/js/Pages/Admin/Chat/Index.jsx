import React, { useState } from "react";
import useChat from "@/utils/useChat";
import ChatWindow from "@/components/chat/ChatWindow";
import Sidebar from "@/components/chat/Sidebar";
import AddUserModal from "@/components/admin/AddUserModal";

export default function AdminChatIndex() {
  const [showAddUser, setShowAddUser] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const { users, authUser, selectedUser, filteredMessages, handleSelectUser, handleSend, isLoading, sendTyping, typing  } = useChat('/admin/chat', showChat);

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
          isAdmin={true}
          onAddUser={() => setShowAddUser(true)}
          onUserSelect={() => setShowChat(true)}
          currentUserId={authUser.id}
          sendTyping={sendTyping}
          typing={typing}
        />
      </div>

      <div className={`${showChat ? 'flex' : 'hidden md:flex'} flex-1`}>
        <ChatWindow
          messages={filteredMessages}
          selectedUser={selectedUser}
          onSend={handleSend}
          currentUserId={authUser.id}
          isAdmin={true}
          onBack={() => {setShowChat(false); handleSelectUser(null);}}
          isLoading={isLoading}
          sendTyping={sendTyping}
          typing={typing}
        />
      </div>

      {showAddUser && (
        <AddUserModal onClose={() => setShowAddUser(false)} />
      )}
    </div>
  );
}