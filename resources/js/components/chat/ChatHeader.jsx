import React from 'react';
import { router } from '@inertiajs/react';

export default function ChatHeader({ selectedUser, isAdmin }) {
  const handleLogout = () => {
    router.post('/logout');
  };

  if (!selectedUser) {
    return (
      <div className="h-14 border-b border-gray-200 flex items-center justify-between px-6 bg-white shrink-0">
        <h3 className="font-semibold text-[#242424]">Messages</h3>
        <LogoutButton onLogout={handleLogout} />
      </div>
    );
  }

  return (
    <div className="h-14 border-b border-gray-200 flex items-center justify-between px-6 bg-white shrink-0 z-10">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-8 h-8 bg-[#edebe9] rounded-full flex items-center justify-center text-xs font-bold text-[#5b5fc7] border border-gray-100 uppercase">
            {selectedUser.name.charAt(0)}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
        </div>

        <div className="flex flex-col">
          <h3 className="text-sm font-bold text-[#242424] leading-tight">
            {selectedUser.name}
          </h3>
          <span className="text-[11px] text-gray-500 font-medium">Available</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* {isAdmin && (
          <button className="flex items-center gap-2 text-xs font-semibold text-[#5b5fc7] hover:bg-[#edebe9] px-3 py-1.5 rounded-md transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <line x1="19" x2="19" y1="8" y2="14"/>
              <line x1="16" x2="22" y1="11" y2="11"/>
            </svg>
            <span>Add people</span>
          </button>
        )} */}
      </div>
    </div>
  );
}

function LogoutButton({ onLogout }) {
  return (
    <button
      onClick={onLogout}
      title="Logout"
      className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" x2="9" y1="12" y2="12"/>
      </svg>
      <span>Logout</span>
    </button>
  );
}