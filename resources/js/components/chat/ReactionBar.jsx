import React, { memo, useMemo } from "react";

function ReactionBar({ reactions, authUserId, userMap, onToggle }) {
  const entries = useMemo(() => {
    return Object.entries(reactions ?? {})
      .filter(([, data]) => data.count > 0)
      .sort((a, b) => b[1].count - a[1].count);
  }, [reactions]);

  if (!entries.length) return null;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "4px",
        marginTop: "4px",
        animation: "reactionBarIn 0.2s ease both",
      }}
    >
      <style>{`
        @keyframes reactionBarIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .rxn-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px 2px 6px;
          border-radius: 12px;
          font-size: 12px;
          cursor: pointer;
          border: 1.5px solid transparent;
          transition: transform 0.12s cubic-bezier(0.34,1.56,0.64,1),
                      background 0.12s, border-color 0.12s, box-shadow 0.12s;
          position: relative;
          user-select: none;
        }
        .rxn-chip:hover {
          transform: scale(1.08);
          box-shadow: 0 2px 8px rgba(108,99,255,0.15);
        }
        .rxn-chip:active {
          transform: scale(0.96);
        }
        .rxn-chip .rxn-tooltip {
          display: none;
          position: absolute;
          bottom: calc(100% + 6px);
          left: 50%;
          transform: translateX(-50%);
          background: rgba(30,30,46,0.92);
          color: #fff;
          font-size: 11px;
          padding: 4px 8px;
          border-radius: 6px;
          white-space: nowrap;
          pointer-events: none;
          z-index: 100;
          backdrop-filter: blur(4px);
        }
        .rxn-chip:hover .rxn-tooltip {
          display: block;
        }
        .rxn-chip .rxn-emoji {
          font-size: 14px;
          line-height: 1;
        }
        .rxn-chip .rxn-count {
          font-weight: 600;
          letter-spacing: -0.02em;
        }
      `}</style>

      {entries.map(([emoji, data]) => {
        const isMine = data.users?.includes(authUserId);

        // Build tooltip: "You, Alice and 2 others"
        const names = (data.users ?? [])
          .slice(0, 3)
          .map((uid) => {
            if (uid === authUserId) return "You";
            return userMap?.[uid] ?? `User ${uid}`;
          });
        const overflow = (data.users?.length ?? 0) - names.length;
        const tooltipText = overflow > 0
          ? `${names.join(", ")} and ${overflow} more`
          : names.join(", ");

        return (
          <button
            key={emoji}
            className="rxn-chip"
            onClick={() => onToggle(emoji)}
            aria-label={`${emoji} ${data.count} reaction${data.count !== 1 ? "s" : ""}. Click to ${isMine ? "remove" : "add"}.`}
            style={{
              background: isMine ? "#ede9fe" : "#f4f4fb",
              borderColor: isMine ? "#6c63ff" : "transparent",
              color: isMine ? "#4f46e5" : "#555",
            }}
          >
            <span className="rxn-tooltip">{tooltipText}</span>
            <span className="rxn-emoji">{emoji}</span>
            <span className="rxn-count">{data.count}</span>
          </button>
        );
      })}
    </div>
  );
}

export default memo(ReactionBar, (prev, next) => {
  return (
    prev.reactions  === next.reactions &&
    prev.authUserId === next.authUserId &&
    prev.userMap    === next.userMap
  );
});