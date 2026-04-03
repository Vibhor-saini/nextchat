import React from 'react';

function StatusTick({ status }) {
  if (status === 'sending') {
    // Single grey clock-style circle — "pending"
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    );
  }

  if (status === 'failed') {
    // Red exclamation
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    );
  }

  // Sent — single tick (like Teams)
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

export default function MessageBubble({ message, isOwn }) {
  const content = message.message;

  return (
    <div className={`flex w-full mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex gap-3 max-w-[75%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>

        {/* Avatar for others */}
        {!isOwn && (
          <div className="w-8 h-8 shrink-0 bg-[#edebe9] rounded-full flex items-center justify-center text-[10px] font-bold text-[#5b5fc7] mt-1 border border-gray-100 uppercase">
            {message.sender_name?.charAt(0) || "U"}
          </div>
        )}

        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          <div
            className={`px-4 py-2 rounded-2xl text-sm shadow-sm border break-words min-w-[50px] ${
              isOwn
                ? 'bg-indigo-500 border-[#d2d5ff] text-white rounded-tr-none'
                : 'bg-white border-gray-200 text-[#242424] rounded-tl-none'
            }`}
          >
            {content}
          </div>

          {/* Timestamp + tick */}
          <div className="flex items-center gap-1 mt-1 px-1">
            <span className="text-[10px] text-gray-400">
              {message.created_at
                ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Just now'}
            </span>
            {isOwn && <StatusTick status={message.status} />}
          </div>
        </div>
      </div>
    </div>
  );
}