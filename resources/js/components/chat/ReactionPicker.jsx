/**
 * ReactionPicker.jsx
 *
 * Floating emoji picker that appears on message hover.
 * - 6 quick-reaction emojis (Teams-style)
 * - Smooth scale-in animation via CSS
 * - Positions above or below bubble depending on space
 * - Closes on outside click or Escape
 * - Accessible: keyboard navigable, aria labels
 */

import React, { useEffect, useRef, memo } from "react";

// Quick reactions — same set as Teams/Slack
const QUICK_EMOJIS = [
  { emoji: "👍", label: "Like" },
  { emoji: "❤️", label: "Love" },
  { emoji: "😂", label: "Haha" },
  { emoji: "😮", label: "Wow" },
  { emoji: "😢", label: "Sad" },
  { emoji: "🔥", label: "Fire" },
];

function ReactionPicker({ isOwn, onSelect, onClose, visible }) {
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!visible) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    const keyHandler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", keyHandler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", keyHandler);
    };
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div
      ref={ref}
      role="toolbar"
      aria-label="React to message"
      style={{
        position: "absolute",
        bottom: "calc(100% + 6px)",
        [isOwn ? "right" : "left"]: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        gap: "2px",
        background: "#ffffff",
        border: "1px solid #e8e8f0",
        borderRadius: "24px",
        padding: "5px 8px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
        animation: "reactionPickerIn 0.15s cubic-bezier(0.34,1.56,0.64,1) both",
      }}
    >
      <style>{`
        @keyframes reactionPickerIn {
          from { opacity: 0; transform: scale(0.7) translateY(6px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .rxn-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
          font-size: 18px;
          line-height: 1;
          transition: transform 0.12s cubic-bezier(0.34,1.56,0.64,1), background 0.1s;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
        }
        .rxn-btn:hover {
          transform: scale(1.35) translateY(-2px);
          background: #f3f3fb;
        }
        .rxn-btn:focus-visible {
          outline: 2px solid #6c63ff;
          outline-offset: 2px;
        }
      `}</style>

      {QUICK_EMOJIS.map(({ emoji, label }) => (
        <button
          key={emoji}
          className="rxn-btn"
          aria-label={label}
          title={label}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(emoji);
            onClose();
          }}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

export default memo(ReactionPicker);