import React, { useState } from 'react';
import { router } from '@inertiajs/react';

export default function Sidebar({ users = [], onSelectUser, selectedUserId, isAdmin = false, onAddUser, onUserSelect }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("recent");
  const [activeNav, setActiveNav] = useState("chat");
  const [mobileRailOpen, setMobileRailOpen] = useState(false);

  const preparedUsers = users.map(user => ({
    ...user,
    sortTimestamp: user.timestamp || (user.created_at ? new Date(user.created_at).getTime() : 0)
  })).sort((a, b) => b.sortTimestamp - a.sortTimestamp);

  const filteredUsers = preparedUsers.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const recentUsers = filteredUsers.filter(u => u.lastMessage);
  const displayUsers = activeTab === 'recent' ? (recentUsers.length > 0 ? recentUsers : filteredUsers) : filteredUsers;

  const handleUserClick = (user) => {
    onSelectUser(user);
    if (onUserSelect) onUserSelect();
  };

  const handleLogout = () => router.post('/logout');

  const formatTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diff < 604800000) return d.toLocaleDateString([], { weekday: 'short' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const avatarColors = [
    ['#e0e7ff', '#4338ca'], ['#fce7f3', '#be185d'],
    ['#dcfce7', '#15803d'], ['#fef3c7', '#b45309'],
    ['#e0f2fe', '#0369a1'], ['#f3e8ff', '#7e22ce'],
  ];
  const getAvatarColors = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];

  const navItems = [
    {
      id: 'chat', title: 'Chat',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    },
    {
      id: 'search', title: 'Search',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
    },
    {
      id: 'activity', title: 'Activity',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
    },
  ];

  const IconRail = ({ onClose }) => (
    <div className="flex flex-col items-center w-14 bg-indigo-700 h-full py-3 shrink-0">
      {/* Logo */}
      <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-5 shrink-0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </div>

      {/* Nav icons */}
      <div className="flex flex-col items-center gap-1 flex-1 w-full px-2">
        {navItems.map(item => (
          <button
            key={item.id}
            title={item.title}
            onClick={() => {
              setActiveNav(item.id);
              if (onClose) onClose();
            }}
            className="relative w-full h-10 rounded-xl flex items-center justify-center transition-all duration-150"
            style={{
              background: activeNav === item.id ? 'rgba(255,255,255,0.2)' : undefined,
              color: activeNav === item.id ? 'white' : 'rgba(199,210,254,0.7)',
            }}
          >
            {activeNav === item.id && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-white rounded-full" />
            )}
            {item.icon}
          </button>
        ))}

        {isAdmin && (
          <button
            onClick={() => { onAddUser?.(); if (onClose) onClose(); }}
            title="Register User"
            className="w-full h-10 rounded-xl flex items-center justify-center transition-all"
            style={{ color: 'rgba(199,210,254,0.7)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'white'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(199,210,254,0.7)'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <line x1="19" x2="19" y1="8" y2="14"/>
              <line x1="16" x2="22" y1="11" y2="11"/>
            </svg>
          </button>
        )}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        title="Logout"
        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
        style={{ color: 'rgba(199,210,254,0.7)' }}
        onMouseEnter={e => { e.currentTarget.style.color = '#fca5a5'; e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(199,210,254,0.7)'; e.currentTarget.style.background = ''; }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" x2="9" y1="12" y2="12"/>
        </svg>
      </button>
    </div>
  );

  const UserListPanel = () => (
    <div
      className="w-full md:w-72 bg-indigo-50 h-full flex flex-col border-r border-indigo-100 shrink-0"
      style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
        {/* Hamburger — mobile only */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileRailOpen(true)}
            className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-indigo-500 hover:bg-indigo-100 transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <h2 className="text-[15px] font-bold text-indigo-900 tracking-tight">Chat</h2>
        </div>

        {isAdmin && (
          <button
            onClick={onAddUser}
            title="Register User"
            className="w-7 h-7 rounded-md flex items-center justify-center text-indigo-400 hover:text-indigo-500 hover:bg-indigo-100 transition-all"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <line x1="19" x2="19" y1="8" y2="14"/>
              <line x1="16" x2="22" y1="11" y2="11"/>
            </svg>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="px-4 pb-3 shrink-0">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search people..."
            className="w-full pl-9 pr-3 py-2 rounded-lg text-[13px] text-indigo-900 placeholder:text-indigo-300 outline-none transition-all bg-white border border-indigo-100 focus:border-indigo-400 shadow-sm"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-indigo-300 hover:text-indigo-500">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-4 gap-1 pb-2 shrink-0">
        {['recent', 'all'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
              activeTab === tab
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'text-indigo-400 hover:text-indigo-500 hover:bg-indigo-100'
            }`}
          >
            {tab === 'recent' ? 'Recent' : 'All'}
          </button>
        ))}
      </div>

      <div className="mx-4 mb-1 border-t border-indigo-100" />

      {/* User list */}
      <div className="flex-1 overflow-y-auto px-2 py-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#c7d2fe transparent' }}>
        {displayUsers.length > 0 ? (
          <div className="space-y-0.5">
            {displayUsers.map(user => {
              const isActive = selectedUserId === user.id;
              const [bgColor, textColor] = getAvatarColors(user.name);
              return (
                <div
                  key={user.id}
                  onClick={() => handleUserClick(user)}
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-500 shadow-sm'
                      : 'hover:bg-indigo-100'
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-white rounded-full" />
                  )}

                  <div className="relative shrink-0">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-[13px] font-bold uppercase"
                      style={{
                        background: isActive ? 'rgba(255,255,255,0.2)' : bgColor,
                        color: isActive ? 'white' : textColor
                      }}
                    >
                      {user.name?.charAt(0) || '?'}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 ${isActive ? 'border-indigo-500' : 'border-indigo-50'}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-1">
                      <span className={`text-[13px] font-semibold truncate ${isActive ? 'text-white' : 'text-indigo-900'}`}>
                        {user.name}
                      </span>
                      {user.sortTimestamp > 0 && (
                        <span className={`text-[10px] whitespace-nowrap shrink-0 ${isActive ? 'text-indigo-200' : 'text-indigo-300'}`}>
                          {formatTime(user.sortTimestamp)}
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] truncate mt-0.5 ${isActive ? 'text-indigo-200' : 'text-indigo-400'}`}>
                      {user.lastMessage || 'Start a conversation'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center mb-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
            </div>
            <p className="text-[12px] text-indigo-300">
              {searchQuery ? `No results for "${searchQuery}"` : 'No conversations yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile: overlay behind icon rail */}
      {mobileRailOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMobileRailOpen(false)}
        />
      )}

      {/* Mobile: icon rail slides in from left */}
      <div className={`
        fixed top-0 left-0 h-full z-50 md:hidden
        transition-transform duration-300 ease-out
        ${mobileRailOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <IconRail onClose={() => setMobileRailOpen(false)} />
      </div>

      {/* Mobile: user list always visible */}
      <div className="md:hidden flex h-full w-full shrink-0">
        <UserListPanel />
      </div>

      {/* Desktop: icon rail + user list always visible */}
      <div className="hidden md:flex h-full shrink-0">
        <IconRail />
        <UserListPanel />
      </div>
    </>
  );
}