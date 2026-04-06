import React, { useState, useRef } from 'react';

export default function ChatInput({ onSend, selectedUser, sendTyping }) {
  const [text, setText] = useState("");
  const inputRef = useRef(null);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  const handleKeyDown = (e) => {
    // Send on Enter, but allow Shift+Enter for new lines
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm focus-within:border-[#5b5fc7] transition-all">
      
      {/* Toolbar - Inline SVGs for Formatting, Attach, Emoji */}
      <div className="flex items-center gap-1 px-2 py-1 border-b border-gray-50">
        <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500 transition-colors" title="Format">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>
        </button>
        <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500 transition-colors" title="Attach">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
        </button>
        <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500 transition-colors" title="Emoji">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>
        </button>
        
        <div className="h-4 w-[1px] bg-gray-200 mx-1" />
        
        <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500 transition-colors" title="Images">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
        </button>
      </div>

      {/* Input Area */}
      <div className="flex items-end p-2 gap-2">
        <textarea
          ref={inputRef}
          rows="1"
          className="flex-1 px-2 py-2 text-sm bg-transparent outline-none resize-none placeholder:text-gray-400 min-h-[40px] max-h-32"
          placeholder="Type a message"
          value={text}
          onChange={(e) => {
            setText(e.target.value);

            if (selectedUser?.conversation_id) {
              sendTyping(selectedUser.conversation_id);
            }
          }}
          onKeyDown={handleKeyDown}
        />
        
        <div className="flex items-center gap-1 mb-1">
          {/* More Options */}
          <button className="p-2 hover:bg-gray-100 rounded-md text-gray-400">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
          </button>
          
          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className={`p-2 rounded-md transition-all ${
              text.trim() 
                ? "text-[#5b5fc7] hover:bg-[#edebe9]" 
                : "text-gray-300 cursor-not-allowed"
            }`}
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill={text.trim() ? "currentColor" : "none"} 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13"/><polyline points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}