import React, { useState } from 'react';
import { useMemo } from 'react';
import { router } from '@inertiajs/react';

export default function Sidebar({ users = [], onSelectUser, selectedUserId, isAdmin = false, onAddUser, onUserSelect, currentUserId }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("recent");
  const [activeNav, setActiveNav] = useState("chat");
  const [mobileRailOpen, setMobileRailOpen] = useState(false);

  const displayUsers = useMemo(() => {
    const prepared = users.map(user => ({
      ...user,
      sortTimestamp: user.timestamp || (user.created_at ? new Date(user.created_at).getTime() : 0)
    })).sort((a, b) => b.sortTimestamp - a.sortTimestamp);

    const filtered = prepared.filter(user =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const recentUsers = filtered.filter(u => u.lastMessage);
    return activeTab === 'recent' ? recentUsers : filtered;
  }, [users, searchQuery, activeTab]);

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

  const navItems = [];

  const IconRail = ({ onClose }) => (
    <div className="flex flex-col items-center w-14 h-full py-3 shrink-0" style={{ background: '#f0f0f8', borderRight: '1px solid #e8e8f4' }}>
      {/* Logo */}
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-5 shrink-0" style={{ background: '#6c63ff' }}>
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
              background: activeNav === item.id ? '#fff' : 'transparent',
              color: activeNav === item.id ? '#6c63ff' : '#b0b0c8',
            }}
          >
            {activeNav === item.id && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full" style={{ background: '#6c63ff' }} />
            )}
            {item.icon}
          </button>
        ))}

        {isAdmin && (
          <button
            onClick={() => { onAddUser?.(); if (onClose) onClose(); }}
            title="Register User"
            className="w-full h-10 rounded-xl flex items-center justify-center transition-all"
            style={{ color: '#b0b0c8' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#6c63ff'; e.currentTarget.style.background = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#b0b0c8'; e.currentTarget.style.background = ''; }}
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
        style={{ color: '#b0b0c8' }}
        onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fee2e2'; }}
        onMouseLeave={e => { e.currentTarget.style.color = '#b0b0c8'; e.currentTarget.style.background = ''; }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" x2="9" y1="12" y2="12"/>
        </svg>
      </button>
    </div>
  );

  const userListPanel = (
    <div
      className="w-full md:w-72 bg-white h-full flex flex-col border-r border-gray-100 shrink-0"
      style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileRailOpen(true)}
            className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ color: '#6c63ff' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <h2 className="text-[20px] font-bold tracking-tight" style={{ color: '#1a1a2e' }}>Chats</h2>
        </div>

        {isAdmin && (
          <button
            onClick={onAddUser}
            title="Register User"
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ color: '#a0a0c0' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#6c63ff'; e.currentTarget.style.background = '#eeeef8'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#a0a0c0'; e.currentTarget.style.background = ''; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#c0c0d8' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages or users"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl text-[13px] outline-none transition-all border"
            style={{
              color: '#1a1a2e',
              background: '#f4f4f9',
              borderColor: '#eaeaf5',
              fontFamily: 'inherit',
            }}
            onFocus={e => { e.target.style.borderColor = '#6c63ff'; e.target.style.background = '#fff'; }}
            onBlur={e => { e.target.style.borderColor = '#eaeaf5'; e.target.style.background = '#f4f4f9'; }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2" style={{ color: '#c0c0d8' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-4 gap-2 pb-3 shrink-0">
        {['recent', 'all'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-2 rounded-xl text-[12px] font-semibold transition-all"
            style={
              activeTab === tab
                ? { background: '#6c63ff', color: '#fff' }
                : { background: 'transparent', color: '#a0a0c0' }
            }
          >
            {tab === 'recent' ? 'Recent' : 'All'}
          </button>
        ))}
      </div>

      <div className="mx-4 mb-1 border-t" style={{ borderColor: '#f0f0f8' }} />

      {/* User list */}
      <div className="flex-1 overflow-y-auto px-2 py-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#ddddf0 transparent' }}>
        {displayUsers.length > 0 ? (
          <div className="space-y-0.5">
            {displayUsers.map(user => {
              const isActive = selectedUserId === user.id;
              const [bgColor, textColor] = getAvatarColors(user.name);

              const isMine = currentUserId && user.lastMessageSenderId === currentUserId;
              const lastMessagePreview = user.lastMessage
                ? (isMine ? `You: ${user.lastMessage}` : user.lastMessage)
                : 'Start a conversation';

              const hasUnread = !isActive && user.unreadCount > 0;

              return (
                <div
                  key={user.id}
                  onClick={() => handleUserClick(user)}
                  className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150"
                  style={
                    isActive
                      ? { background: '#f0efff', border: '1px solid #e0deff' }
                      : { border: '1px solid transparent' }
                  }
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f7f7fc'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = ''; }}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full" style={{ background: '#6c63ff' }} />
                  )}

                  <div className="relative shrink-0">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold uppercase"
                      style={{ background: bgColor, color: textColor }}
                    >
                      {user.name?.slice(0, 2) || '?'}
                    </div>
                    <span
                      className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2"
                      style={{ borderColor: isActive ? '#f0efff' : '#fff' }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-1">
                      <span className="text-[13px] truncate font-semibold" style={{ color: '#1a1a2e' }}>
                        {user.name}
                      </span>
                      {user.sortTimestamp > 0 && (
                        <span
                          className="text-[10px] whitespace-nowrap shrink-0 font-medium"
                          style={{ color: hasUnread ? '#6c63ff' : '#c0c0d8' }}
                        >
                          {formatTime(user.sortTimestamp)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-1 mt-0.5">
                      <p
                        className="text-[11px] truncate"
                        style={{
                          color: hasUnread ? '#4a4a7a' : '#a0a0c0',
                          fontWeight: hasUnread ? 500 : 400,
                        }}
                      >
                        {lastMessagePreview}
                      </p>
                      {hasUnread && (
                        <span
                          className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] font-bold flex items-center justify-center leading-none"
                          style={{ background: '#6c63ff' }}
                        >
                          {user.unreadCount > 99 ? '99+' : user.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: '#f0efff' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a89fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
            </div>
            <p className="text-[12px]" style={{ color: '#c0c0d8' }}>
              {searchQuery ? `No results for "${searchQuery}"` : 'No conversations yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {mobileRailOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMobileRailOpen(false)}
        />
      )}

      <div className={`
        fixed top-0 left-0 h-full z-50 md:hidden
        transition-transform duration-300 ease-out
        ${mobileRailOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <IconRail onClose={() => setMobileRailOpen(false)} />
      </div>

      <div className="md:hidden flex h-full w-full shrink-0">
        {userListPanel}
      </div>

      <div className="hidden md:flex h-full shrink-0">
        <IconRail />
        {userListPanel}
      </div>
    </>
  );
}