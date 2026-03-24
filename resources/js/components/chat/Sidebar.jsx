import React, { useState } from 'react';

export default function Sidebar({ users = [], onSelectUser, selectedUserId }) {
  const [searchQuery, setSearchQuery] = useState("");

  // 1. NORMALIZE & SORT: Prepare users with a timestamp for sorting
  const preparedUsers = users.map(user => ({
    ...user,
    // Convert created_at to a number for comparison, fallback to 0 for new users
    sortTimestamp: user.timestamp || (user.created_at ? new Date(user.created_at).getTime() : 0)
  })).sort((a, b) => b.sortTimestamp - a.sortTimestamp);

  // 2. SEARCH FILTER: Filter by name
  const filteredUsers = preparedUsers.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-80 bg-[#f5f5f5] border-r border-gray-200 flex flex-col h-screen font-sans text-[#242424]">
      
      {/* Header */}
      <div className="h-14 px-4 flex items-center justify-between shrink-0">
        <h1 className="text-xl font-bold tracking-tight">Chat</h1>
        <div className="flex gap-1">
          <button className="p-2 hover:bg-gray-200 rounded-md transition-colors text-gray-600">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
          </button>
          <button className="p-2 hover:bg-gray-200 rounded-md transition-colors text-[#5b5fc7]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
        </div>
      </div>

      {/* Search Bar - Now Functional */}
      <div className="px-4 py-2 shrink-0">
        <div className="relative flex items-center group">
          <div className="absolute left-3 text-gray-400 group-focus-within:text-[#5b5fc7] transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm focus:border-b-2 focus:border-b-[#5b5fc7] outline-none transition-all placeholder:text-gray-500 shadow-sm"
            placeholder="Search by name..."
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-2 text-gray-400 hover:text-gray-600"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          )}
        </div>
      </div>

      <div className="flex px-4 mt-2 gap-4 border-b border-gray-200 text-xs font-semibold text-gray-500 shrink-0">
        <button className="pb-2 border-b-2 border-[#5b5fc7] text-[#242424]">Recent</button>
        <button className="pb-2 border-b-2 border-transparent hover:text-[#5b5fc7]">Contacts</button>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto pt-2 scrollbar-thin">
        {filteredUsers.length > 0 ? (
          filteredUsers.map(user => {
            const isActive = selectedUserId === user.id;

            return (
              <div
                key={user.id}
                onClick={() => onSelectUser(user)} 
                className={`group flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors relative ${
                  isActive ? 'bg-white shadow-[inset_0_1px_0_0_rgba(0,0,0,0.05)]' : 'hover:bg-gray-200/50'
                }`}
              >
                {/* Active Indicator */}
                <div className={`absolute left-0 w-1 h-8 bg-[#5b5fc7] rounded-r-full transition-opacity ${
                  isActive ? 'opacity-100' : 'opacity-0'
                }`} />
                
                <div className="relative shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border transition-all ${
                    isActive ? 'bg-[#5b5fc7] text-white border-[#5b5fc7]' : 'bg-[#edebe9] text-[#5b5fc7] border-gray-200'
                  }`}>
                    {user.name ? user.name.charAt(0) : '?'}
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#f5f5f5] rounded-full"></span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <span className={`text-sm truncate ${isActive ? 'font-bold text-[#5b5fc7]' : 'font-semibold text-[#242424]'}`}>
                      {user.name}
                    </span>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                      {user.sortTimestamp > 0 
                        ? new Date(user.sortTimestamp).toLocaleDateString([], { weekday: 'short' }) 
                        : ''}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={`text-xs truncate pr-2 ${isActive ? 'text-[#242424] font-medium' : 'text-gray-500'}`}>
                      {user.lastMessage || "Click to start chatting"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="px-6 py-10 text-center text-xs text-gray-400 italic">
            {searchQuery ? `No results for "${searchQuery}"` : "No recent chats found"}
          </div>
        )}
      </div>
    </div>
  );
}