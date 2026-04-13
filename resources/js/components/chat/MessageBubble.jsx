import React, { memo, useMemo } from 'react';

const avatarColors = [
  ['#e0e7ff', '#4338ca'], ['#fce7f3', '#be185d'],
  ['#dcfce7', '#15803d'], ['#fef3c7', '#b45309'],
  ['#e0f2fe', '#0369a1'], ['#f3e8ff', '#7e22ce'],
];

function getAvatarColors(name) {
  return avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];
}

// Pre-format time once — not on every render
function formatTime(isoString) {
  if (!isoString) return 'Just now';
  return new Date(isoString).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// // Status icon — pure, no state
// function StatusTick({ status }) {
//   if (status === 'sending') {
//     return (
//       <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//         <circle cx="12" cy="12" r="10"/>
//         <polyline points="12 6 12 12 16 14"/>
//       </svg>
//     );
//   }
//   if (status === 'failed') {
//     return (
//       <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//         <circle cx="12" cy="12" r="10"/>
//         <line x1="12" y1="8" x2="12" y2="12"/>
//         <line x1="12" y1="16" x2="12.01" y2="16"/>
//       </svg>
//     );
//   }
//   // NEW: Eye icon for Seen status
//   if (status === 'seen') {
//     return (
//       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//         <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
//         <circle cx="12" cy="12" r="3"></circle>
//       </svg>
//     );
//   }
  
//   return (
//     // null
//     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//       <polyline points="20 6 9 17 4 12"/>
//     </svg>
//   );
// }

// function MessageBubble({ message, isOwn }) {
//   const content = message.message;

//   // useMemo so time string isn't recalculated unless created_at changes
//   const timeString = useMemo(() => formatTime(message.created_at), [message.created_at]);

//   const [bgColor, textColor] = useMemo(
//     () => getAvatarColors(message.sender_name),
//     [message.sender_name]
//   );

//   return (
//     <div className={`flex w-full mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
//       <div className={`flex gap-3 max-w-[75%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>

//         {/* Avatar for others */}
//         {!isOwn && (
//           <div
//             className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-[11px] font-bold mt-1 uppercase"
//             style={{ background: bgColor, color: textColor }}
//           >
//             {message.sender_name?.slice(0, 2) || 'U'}
//           </div>
//         )}

//         <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
//           <div
//             className={`px-4 py-2 rounded-2xl text-sm break-words min-w-[50px] ${
//               isOwn
//                 ? 'rounded-tr-none text-white'
//                 : 'rounded-tl-none text-[#242424]'
//             }`}
//             style={
//               isOwn
//                 ? { background: '#6c63ff', border: '1px solid #5a52e0' }
//                 : { background: '#fff', border: '1px solid #f0f0f8' }
//             }
//           >
//             {content}
//           </div>

//           <div className="flex items-center gap-1 mt-1 px-1">
//             <span className="text-[10px]" style={{ color: '#c0c0d8' }}>
//               {timeString}
//             </span>
//             {isOwn && <StatusTick status={message.status} />}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Deep equality check — only re-render if message content or status actually changed
// export default memo(MessageBubble, (prev, next) => {
//   return (
//     prev.message.id        === next.message.id &&
//     prev.message.message   === next.message.message &&
//     prev.message.status    === next.message.status &&
//     prev.isOwn             === next.isOwn
//   );
// });

// Inside MessageBubble.jsx

// 1. Update StatusTick to handle blue color for seen
// function StatusTick({ status }) {
//   if (status === 'sending') {
//     return (
//       <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//         <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
//       </svg>
//     );
//   }
//   if (status === 'failed') {
//     return (
//       <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//         <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
//       </svg>
//     );
//   }
  
//   // SEEN: Change stroke color to blue (e.g., #3b82f6)
//   if (status === 'seen') {
//     return (
//       <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
//         <polyline points="20 6 9 17 4 12"/>
//       </svg>
//     );
//   }

//   // DEFAULT (Delivered/Sent): Grey/Pale tick
//   return (
//     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//       <polyline points="20 6 9 17 4 12"/>
//     </svg>
//   );
// }
function StatusTick({ status }) {
  // 1. Sending (Circle/Clock)
  if (status === 'sending') {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    );
  }

  // 2. Failed (Red Alert)
  if (status === 'failed') {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    );
  }

  // 3. Seen (Blue Double Tick)
  if (status === 'seen') {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 12l5 5L22 7M2 12l5 5L13 11" />
      </svg>
    );
  }

  // 4. Delivered (Grey Double Tick)
  if (status === 'delivered') {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 12l5 5L22 7M2 12l5 5L13 11" />
      </svg>
    );
  }

  // 5. Default/Sent (Single Grey Tick)
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

// 2. Update MessageBubble to receive 'isLast'
function MessageBubble({ message, isOwn, isLast }) { 
  const content = message.message;
  const timeString = useMemo(() => formatTime(message.created_at), [message.created_at]);

  const [bgColor, textColor] = useMemo(
    () => getAvatarColors(message.sender_name),
    [message.sender_name]
  );

  return (
    <div className={`flex w-full mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex gap-3 max-w-[75%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isOwn && (
          <div className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-[11px] font-bold mt-1 uppercase" style={{ background: bgColor, color: textColor }}>
            {message.sender_name?.slice(0, 2) || 'U'}
          </div>
        )}

        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          <div className={`px-4 py-2 rounded-2xl text-sm break-words min-w-[50px] ${isOwn ? 'rounded-tr-none text-white' : 'rounded-tl-none text-[#242424]'}`}
            style={isOwn ? { background: '#6c63ff', border: '1px solid #5a52e0' } : { background: '#fff', border: '1px solid #f0f0f8' }}>
            {content}
          </div>

          <div className="flex items-center gap-1 mt-1 px-1">
            <span className="text-[10px]" style={{ color: '#c0c0d8' }}>
              {timeString}
            </span>
            {/* 3. Logic: Only show tick if it's your own message AND it's the last one */}
            {isOwn && isLast && <StatusTick status={message.status} />}
          </div>
        </div>
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
    prev.isLast          === next.isLast
  );
});