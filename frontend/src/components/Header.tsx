'use client';

import { useState } from 'react';
import NotificationDropdown from './NotificationDropdown';

export default function Header({ onToggleSidebar, userName, userRole }: { onToggleSidebar: () => void; userName: string; userRole?: string }) {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header className="h-16 flex items-center px-6 gap-3 shrink-0 border-b border-[rgba(255,255,255,0.06)]">
      <button
        onClick={onToggleSidebar}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:text-white hover:bg-card-hover transition-all duration-200 cursor-pointer active:scale-[0.95]"
        title="تغییر وضعیت سایدبار"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="flex-1" />

      <NotificationDropdown />

      <div className="relative">
        <button
          onClick={() => setShowProfile(!showProfile)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-card-hover transition-all duration-200 cursor-pointer active:scale-[0.98]"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
            {userName?.charAt(0) || '?'}
          </div>
          <div className="hidden md:block text-right min-w-0">
            <p className="text-sm text-white font-medium truncate max-w-[120px]">{userName}</p>
            {userRole && (
              <p className="text-[10px] text-text-muted truncate max-w-[120px]">{userRole}</p>
            )}
          </div>
        </button>
      </div>
    </header>
  );
}
