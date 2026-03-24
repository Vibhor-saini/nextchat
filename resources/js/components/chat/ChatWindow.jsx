import React, { useEffect, useRef } from 'react';
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import ChatHeader from "./ChatHeader";

export default function ChatWindow({
  messages = [],
  selectedUser,
  onSend,
  isAdmin,
  currentUserId,
}) {
  const scrollRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white text-gray-500">
        <div className="w-16 h-16 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
           <span className="text-2xl">💬</span>
        </div>
        <p className="text-sm font-medium">Select a chat to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full bg-white shadow-sm transition-all overflow-hidden">
      {/* Header */}
      <ChatHeader selectedUser={selectedUser} isAdmin={isAdmin} />

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-6 scroll-smooth w-full"
        style={{ 
          backgroundImage: 'radial-gradient(#f0f0f0 1px, transparent 1px)', 
          backgroundSize: '20px 20px' 
        }}
      >
        {/* Date Separator */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-200"></div>
          <span className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Today</span>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>

        {messages.length > 0 ? (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id} 
              message={msg}
              isOwn={Number(msg.sender_id) === Number(currentUserId)} // Ensure type match
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full opacity-40 italic text-sm">
            No messages yet. Say hello!
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="px-6 py-4 border-t border-gray-100 bg-white shrink-0">
        <ChatInput onSend={onSend} />
        <div className="mt-2 text-[10px] text-gray-400 flex gap-4">
          <span><b>Alt + Enter</b> to newline</span>
          <span>Check spelling is <b>On</b></span>
        </div>
      </div>
    </div>
  );
}