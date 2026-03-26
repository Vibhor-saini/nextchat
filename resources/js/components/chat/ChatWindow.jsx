import React, { useEffect, useRef } from 'react';
import ChatHeader from '@/components/chat/ChatHeader';
import ChatInput from '@/components/chat/ChatInput';
import MessageBubble from '@/components/chat/MessageBubble';

export default function ChatWindow({ messages = [], selectedUser, onSend, currentUserId, isAdmin = false, onBack }) {
  const bottomRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Empty state — no user selected
  if (!selectedUser) {
    return (
      <div className="flex flex-col flex-1 h-screen bg-[#fafafa]">
        <ChatHeader selectedUser={null} isAdmin={isAdmin} />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <div className="w-16 h-16 bg-[#edebe9] rounded-full flex items-center justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5b5fc7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h2 className="text-base font-bold text-[#242424] mb-1">No conversation selected</h2>
          <p className="text-sm text-gray-400">Pick someone from the sidebar to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-screen bg-[#fafafa] min-w-0">

      {/* Header with optional back button on mobile */}
      <div className="relative shrink-0">
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 hover:bg-gray-100 rounded-md text-gray-500"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
        )}
        <ChatHeader selectedUser={selectedUser} isAdmin={isAdmin} />
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 scrollbar-thin scrollbar-thumb-gray-200">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-12 h-12 bg-[#edebe9] rounded-full flex items-center justify-center mb-3">
              <span className="text-lg font-bold text-[#5b5fc7] uppercase">
                {selectedUser.name?.charAt(0)}
              </span>
            </div>
            <p className="text-sm font-semibold text-[#242424]">{selectedUser.name}</p>
            <p className="text-xs text-gray-400 mt-1">No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={Number(msg.sender_id) === Number(currentUserId)}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 shrink-0 bg-white border-t border-gray-100">
        <ChatInput onSend={onSend} />
      </div>
    </div>
  );
}