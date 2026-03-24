import React, { useState, useEffect } from "react";
import { usePage, router } from "@inertiajs/react";
import Sidebar from "@/components/chat/Sidebar"; // We can reuse the sidebar or keep it inline
import ChatWindow from "@/components/chat/ChatWindow";

export default function AdminChatIndex() {
  const { conversations, otherUsers, authUser, chatHistory } = usePage().props;

  const [selectedUser, setSelectedUser] = useState(null);
  const [allMessages, setAllMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Sync messages from Database
  useEffect(() => {
    if (chatHistory) {
      setAllMessages(chatHistory);
    }
  }, [chatHistory]);

  // 2. Normalize and Sort User List
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
  ].sort((a, b) => b.timestamp - a.timestamp);

  // 3. Filter list by search query
  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 4. Handle Selection (Matches the controller logic)
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    // Use router.get with only: ['chatHistory'] for speed
    router.get('/chat', { selected: user.id }, {
      preserveState: true,
      replace: true,
      only: ['chatHistory', 'conversations'] 
    });
  };

  // 5. Robust Message Filter for the window
  const filteredMessages = allMessages.filter(msg => {
    if (!selectedUser) return false;
    
    // Match by Conversation ID
    if (msg.conversation_id && selectedUser.conversation_id && 
        Number(msg.conversation_id) === Number(selectedUser.conversation_id)) {
      return true;
    }
    // Fallback match by User IDs
    const iSent = Number(msg.sender_id) === Number(authUser.id) && Number(msg.receiver_id) === Number(selectedUser.id);
    const theySent = Number(msg.sender_id) === Number(selectedUser.id) && Number(msg.receiver_id) === Number(authUser.id);
    return iSent || theySent;
  });

  const handleSend = (text) => {
    if (!selectedUser) return;
    const tempId = `temp-${Date.now()}`;
    const newMessage = {
      id: tempId,
      message: text,
      sender_id: authUser.id,
      receiver_id: selectedUser.id,
      conversation_id: selectedUser.conversation_id,
      created_at: new Date().toISOString(),
    };

    setAllMessages(prev => [...prev, newMessage]);

    router.post('/messages', {
      message: text,
      receiver_id: selectedUser.id,
    }, { preserveScroll: true });
  };

  return (
    <div className="flex h-screen bg-[#2b2d31] overflow-hidden">
      
      {/* LEFT ICON BAR (Static) */}
      <div className="w-16 bg-[#1e1f22] flex flex-col items-center py-4 space-y-4 shrink-0">
        <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center text-white font-bold cursor-pointer hover:rounded-xl transition-all">A</div>
        <div className="w-12 h-12 bg-[#313338] rounded-3xl flex items-center justify-center text-gray-400 cursor-pointer hover:bg-green-600 hover:text-white hover:rounded-xl transition-all">+</div>
      </div>

      {/* CHAT LIST PANEL (Sidebar) */}
      <div className="w-72 bg-[#2b2d31] flex flex-col border-r border-[#1e1f22]">
        <div className="h-12 px-4 flex items-center shadow-sm border-b border-[#1e1f22] shrink-0">
          <input 
            className="w-full bg-[#1e1f22] text-xs text-gray-200 px-2 py-1.5 rounded outline-none" 
            placeholder="Find a conversation"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => handleSelectUser(user)}
              className={`flex items-center gap-3 p-2 rounded cursor-pointer group ${
                selectedUser?.id === user.id ? 'bg-[#404249] text-white' : 'text-gray-400 hover:bg-[#35373c] hover:text-gray-200'
              }`}
            >
              <div className="w-8 h-8 bg-gray-600 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold uppercase">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{user.name}</div>
                <div className="text-[11px] truncate opacity-60">
                  {user.lastMessage || "Start a chat"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CHAT WINDOW */}
      <div className="flex-1 flex flex-col bg-[#313338]">
        {selectedUser ? (
          <ChatWindow
            messages={filteredMessages}
            selectedUser={selectedUser}
            onSend={handleSend}
            currentUserId={authUser.id}
            isAdmin={true}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
             <div className="w-20 h-20 bg-[#2b2d31] rounded-full mb-4 flex items-center justify-center text-3xl">👋</div>
             <p>Welcome back, Admin</p>
          </div>
        )}
      </div>
    </div>
  );
}