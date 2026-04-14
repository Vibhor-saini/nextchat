import React, { memo, useMemo, useState, useCallback, useRef } from "react";
import ReactionPicker from "./ReactionPicker";
import ReactionBar from "./ReactionBar";

// ── Avatar color palette ───────────────────────────────────────────────────────
const avatarColors = [
  ["#e0e7ff", "#4338ca"], ["#fce7f3", "#be185d"],
  ["#dcfce7", "#15803d"], ["#fef3c7", "#b45309"],
  ["#e0f2fe", "#0369a1"], ["#f3e8ff", "#7e22ce"],
];

function getAvatarColors(name) {
  return avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];
}

// ── Time formatter ─────────────────────────────────────────────────────────────
function formatTime(isoString) {
  if (!isoString) return "Just now";
  return new Date(isoString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Status tick ────────────────────────────────────────────────────────────────
function StatusTick({ status }) {
  if (status === "sending") {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
        stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    );
  }
  if (status === "failed") {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
        stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    );
  }
  if (status === "seen") {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 12l5 5L22 7M2 12l5 5L13 11"/>
      </svg>
    );
  }
  if (status === "delivered") {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 12l5 5L22 7M2 12l5 5L13 11"/>
      </svg>
    );
  }
  // sent
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

// ── Hover action button (emoji trigger) ───────────────────────────────────────
function HoverActions({ isOwn, onEmojiClick, visible }) {
  if (!visible) return null;
  return (
    <button
      aria-label="Add reaction"
      onClick={onEmojiClick}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "3px 5px",
        borderRadius: "6px",
        color: "#a0a0b8",
        fontSize: "16px",
        lineHeight: 1,
        transition: "color 0.1s, background 0.1s",
        alignSelf: "center",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "#6c63ff";
        e.currentTarget.style.background = "#f0efff";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "#a0a0b8";
        e.currentTarget.style.background = "none";
      }}
    >
      {/* Smiley + plus icon */}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M8 13s1.5 2 4 2 4-2 4-2"/>
        <line x1="9" y1="9" x2="9.01" y2="9"/>
        <line x1="15" y1="9" x2="15.01" y2="9"/>
        <line x1="19" y1="5" x2="22" y2="5"/>
        <line x1="20.5" y1="3.5" x2="20.5" y2="6.5"/>
      </svg>
    </button>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
function MessageBubble({ message, isOwn, isLast, authUserId, userMap, onReact, reactions, senderName  }) {
  const [hovered, setHovered]           = useState(false);
  const [pickerOpen, setPickerOpen]     = useState(false);
  const containerRef                    = useRef(null);

  const content    = message.message;
  const timeString = useMemo(() => formatTime(message.created_at), [message.created_at]);

  const [bgColor, textColor] = useMemo(
    () => getAvatarColors(senderName),
    [senderName]
  );

  const handleEmojiClick = useCallback((e) => {
    e.stopPropagation();
    setPickerOpen((p) => !p);
  }, []);

  const handleReactionSelect = useCallback((emoji) => {
    onReact?.(message.id, emoji);
  }, [message.id, onReact]);

  const hasReactions = reactions && Object.keys(reactions).length > 0;

  return (
    <div
      ref={containerRef}
      className={`flex w-full ${hasReactions ? "mb-6" : "mb-4"} ${isOwn ? "justify-end" : "justify-start"}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); }}
    >
      {/* Inner row: avatar + bubble + hover action */}
      <div
        className={`flex gap-2 max-w-[75%] items-end ${isOwn ? "flex-row-reverse" : "flex-row"}`}
        style={{ position: "relative" }}
      >
        {/* Avatar — only for other user's messages */}
        {!isOwn && (
          <div
            className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-[11px] font-bold uppercase"
            style={{ background: bgColor, color: textColor, marginBottom: hasReactions ? "22px" : "0" }}
          >
            {senderName?.slice(0, 2) || '??'}
          </div>
        )}

        {/* Bubble column */}
        <div
          className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
          style={{ position: "relative" }}
        >
          {/* Reaction picker — positioned above bubble */}
          <ReactionPicker
            isOwn={isOwn}
            visible={pickerOpen}
            onSelect={handleReactionSelect}
            onClose={() => setPickerOpen(false)}
          />

          {/* Bubble */}
          <div
            className={`px-4 py-2 rounded-2xl text-sm break-words min-w-[50px] ${
              isOwn ? "rounded-tr-none text-white" : "rounded-tl-none text-[#242424]"
            }`}
            style={
              isOwn
                ? { background: "#6c63ff", border: "1px solid #5a52e0" }
                : { background: "#fff",    border: "1px solid #f0f0f8" }
            }
          >
            {content}
          </div>

          {/* Timestamp + status */}
          <div className="flex items-center gap-1 mt-1 px-1">
            <span className="text-[10px]" style={{ color: "#c0c0d8" }}>
              {timeString}
            </span>
            {isOwn && isLast && <StatusTick status={message.status} />}
          </div>

          {/* Reaction bar — below bubble */}
          {hasReactions && (
            <ReactionBar
              reactions={reactions}
              authUserId={authUserId}
              userMap={userMap}
              onToggle={handleReactionSelect}
            />
          )}
        </div>

        {/* Hover action button — emoji trigger */}
        <HoverActions
          isOwn={isOwn}
          visible={hovered || pickerOpen}
          onEmojiClick={handleEmojiClick}
        />
      </div>
    </div>
  );
}

export default memo(MessageBubble, (prev, next) => {
  return (
    prev.message.id      === next.message.id &&
    prev.message.message === next.message.message &&
    prev.message.status  === next.message.status &&
    prev.isOwn           === next.isOwn &&
    prev.isLast          === next.isLast &&
    prev.reactions       === next.reactions &&   // ref equality — object from reactionStore
    prev.authUserId      === next.authUserId &&
    prev.userMap         === next.userMap &&
    prev.senderName      === next.senderName
  );
});