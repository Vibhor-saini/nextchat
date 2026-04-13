import React, { useState, useRef, useCallback, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';

export default function ChatInput({ onSend, selectedUser, sendTyping }) {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);

  const textareaRef = useRef(null);
  const pickerRef = useRef(null);

  // Insert emoji at cursor
  const insertEmoji = useCallback((emojiData) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const emoji = emojiData.emoji;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const newText =
      text.substring(0, start) +
      emoji +
      text.substring(end);

    setText(newText);

    // restore cursor
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd =
        start + emoji.length;
      textarea.focus();
    }, 0);
  }, [text]);

  const handleSend = () => {
    if (!text.trim()) return;

    onSend(text);
    setText("");
    setShowEmoji(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target)
      ) {
        setShowEmoji(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setShowEmoji(false);
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <div className="relative flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm focus-within:border-[#5b5fc7] transition-all">
      
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1 border-b border-gray-50">
        
        {/* Format */}
        <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="4 7 4 4 20 4 20 7"/>
            <line x1="9" x2="15" y1="20" y2="20"/>
            <line x1="12" x2="12" y1="4" y2="20"/>
          </svg>
        </button>

        {/* Attach */}
        <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
        </button>

        {/* Emoji Button */}
        <button
          onClick={() => setShowEmoji(prev => !prev)}
          className="p-1.5 hover:bg-gray-100 rounded text-gray-500"
        >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>
        </button>

        <div className="h-4 w-[1px] bg-gray-200 mx-1" />

        {/* Image */}
        <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
        </button>
      </div>

      {/* Emoji Picker */}
      {showEmoji && (
        <div
          ref={pickerRef}
          className="absolute bottom-16 left-2 z-50 shadow-lg"
        >
          <EmojiPicker onEmojiClick={insertEmoji} />
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end p-2 gap-2">
        <textarea
          ref={textareaRef}
          rows="1"
          value={text}
          className="flex-1 px-2 py-2 text-sm bg-transparent outline-none resize-none placeholder:text-gray-400 min-h-[40px] max-h-32"
          placeholder="Type a message"
          onChange={(e) => {
            setText(e.target.value);
            if (selectedUser?.conversation_id) {
              sendTyping(selectedUser.conversation_id);
            }
          }}
          onKeyDown={handleKeyDown}
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className={`p-2 rounded-md ${
            text.trim()
              ? "text-[#5b5fc7] hover:bg-[#edebe9]"
              : "text-gray-300 cursor-not-allowed"
          }`}
        >
          ➤
        </button>
      </div>
    </div>
  );
}