import React from 'react';
import { router } from '@inertiajs/react';

export default function ChatHeader({ selectedUser, isAdmin }) {
  const handleLogout = () => {
    router.post('/logout');
  };

  const avatarColors = [
    ['#e0e7ff', '#4338ca'], ['#fce7f3', '#be185d'],
    ['#dcfce7', '#15803d'], ['#fef3c7', '#b45309'],
    ['#e0f2fe', '#0369a1'], ['#f3e8ff', '#7e22ce'],
  ];
  const getAvatarColors = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];

  if (!selectedUser) {
    return (
      <div className="h-16 border-b flex items-center justify-between px-6 bg-white shrink-0" style={{ borderColor: '#f0f0f8' }}>
        <h3 className="font-bold text-[15px]" style={{ color: '#1a1a2e' }}>Messages</h3>
      </div>
    );
  }

  const [bgColor, textColor] = getAvatarColors(selectedUser.name);

  return (
    <div className="h-16 border-b flex items-center justify-between px-6 bg-white shrink-0 z-10" style={{ borderColor: '#f0f0f8' }}>
      <div className="flex items-center gap-3">
        <div className="relative">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold uppercase"
            style={{ background: bgColor, color: textColor }}
          >
            {selectedUser.name?.slice(0, 2) || '?'}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
        </div>

        <div className="flex flex-col">
          <h3 className="text-[14px] font-bold leading-tight" style={{ color: '#1a1a2e' }}>
            {selectedUser.name}
          </h3>
          <span className="text-[11px] font-medium" style={{ color: '#a0a0c0' }}>Available</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Search icon */}
        <button
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
          style={{ color: '#b0b0c8' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#6c63ff'; e.currentTarget.style.background = '#f0efff'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#b0b0c8'; e.currentTarget.style.background = ''; }}
          title="Search in conversation"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
        </button>

        {/* More options */}
        <button
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
          style={{ color: '#b0b0c8' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#6c63ff'; e.currentTarget.style.background = '#f0efff'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#b0b0c8'; e.currentTarget.style.background = ''; }}
          title="More options"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
          </svg>
        </button>
      </div>
    </div>
  );
}