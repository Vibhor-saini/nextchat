import React from 'react';

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
          
          {/* Timestamp */}
          <span className="text-[10px] text-gray-400 mt-1 px-1">
            {message.created_at ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
          </span>
        </div>
      </div>
    </div>
  );
}