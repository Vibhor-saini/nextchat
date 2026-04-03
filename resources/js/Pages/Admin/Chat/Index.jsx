import React, { useState } from "react";
import useChat from "@/utils/useChat";
import ChatWindow from "@/components/chat/ChatWindow";
import Sidebar from "@/components/chat/Sidebar";
import AddUserModal from "@/components/admin/AddUserModal";

export default function AdminChatIndex() {
  const { users, authUser, selectedUser, filteredMessages, handleSelectUser, handleSend, isLoading  } = useChat('/admin/chat');
  const [showAddUser, setShowAddUser] = useState(false);
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
          isAdmin={true}
          onAddUser={() => setShowAddUser(true)}
          onUserSelect={() => setShowChat(true)}
          currentUserId={authUser.id}
        />
      </div>

      <div className={`${showChat ? 'flex' : 'hidden md:flex'} flex-1`}>
        <ChatWindow
          messages={filteredMessages}
          selectedUser={selectedUser}
          onSend={handleSend}
          currentUserId={authUser.id}
          isAdmin={true}
          onBack={() => setShowChat(false)}
          isLoading={isLoading}
        />
      </div>

      {showAddUser && (
        <AddUserModal onClose={() => setShowAddUser(false)} />
      )}
    </div>
  );
}