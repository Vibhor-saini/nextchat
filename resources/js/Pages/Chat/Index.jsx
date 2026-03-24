import React, { useState, useEffect } from "react";
import { usePage, router } from "@inertiajs/react";
import Sidebar from "@/components/chat/Sidebar";
import ChatWindow from "@/components/chat/ChatWindow";

export default function Chat() {
  const { conversations, otherUsers, authUser, chatHistory } = usePage().props;

  const [selectedUser, setSelectedUser] = useState(null);
  const [allMessages, setAllMessages] = useState([]);

  useEffect(() => {
    if (chatHistory) {
      setAllMessages(chatHistory);
    }
  }, [chatHistory]);

  const users = [
    ...conversations.map(conv => {
      const user = conv.users.find(u => u.id !== authUser.id);
      return { 
        ...user, 
        conversation_id: conv.id,
        lastMessage: conv.latest_message?.message,
        timestamp: conv.latest_message ? new Date(conv.latest_message.created_at).getTime() : 0 
      };
    }),
    ...otherUsers.map(u => ({ ...u, timestamp: 0, conversation_id: null }))
  ];

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    router.get('/chat', { selected: user.id }, {
      preserveState: true,
      replace: true,
      only: ['chatHistory', 'conversations'] 
    });
  };

  const filteredMessages = allMessages.filter(msg => {
    if (!selectedUser) return false;

    if (msg.conversation_id && selectedUser.conversation_id && 
        Number(msg.conversation_id) === Number(selectedUser.conversation_id)) {
      return true;
    }

    const myId = Number(authUser.id);
    const theirId = Number(selectedUser.id);
    const msgSender = Number(msg.sender_id);
    const msgReceiver = Number(msg.receiver_id);

    const iSentIt = msgSender === myId && msgReceiver === theirId;
    const theySentIt = msgSender === theirId && (msgReceiver === myId || !msgReceiver);

    return iSentIt || theySentIt;
  });

  const handleSend = (text) => {
    if (!selectedUser || !text.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const newMessage = {
      id: tempId,
      message: text,
      sender_id: authUser.id,
      receiver_id: selectedUser.id,
      conversation_id: selectedUser.conversation_id,
      created_at: new Date().toISOString(),
    };

    setAllMessages((prev) => [...prev, newMessage]);

    router.post('/messages', {
      message: text,
      receiver_id: selectedUser.id,
    }, {
      preserveScroll: true,
      onError: (err) => console.error("Send Error:", err)
    });
  };

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