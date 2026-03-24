import React from 'react';

export default function ChatHeader({ selectedUser, isAdmin }) {
  if (!selectedUser) {
    return (
      <div className="h-14 border-b border-gray-200 flex items-center px-6 bg-white shrink-0">
        <h3 className="font-semibold text-[#242424]">Messages</h3>
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
          <h3 className="text-sm font-bold text-[#242424] leading-tight leading-none">
            {selectedUser.name}
          </h3>
          <span className="text-[11px] text-gray-500 font-medium">Available</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 hover:bg-gray-100 rounded-md text-gray-600">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>
        </button>

        {isAdmin && (
          <button className="flex items-center gap-2 text-xs font-semibold text-[#5b5fc7] hover:bg-[#edebe9] px-3 py-1.5 rounded-md transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="16" x2="22" y1="11" y2="11"/></svg>
            <span>Add people</span>
          </button>
        )}
      </div>
    </div>
  );
}