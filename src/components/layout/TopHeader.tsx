'use client';

import React, { useState } from 'react';
import { UploadModal } from './UploadModal';
import { NotificationDropdown, NotificationItem } from './NotificationDropdown';
import { Toast } from '../ui/Toast';

interface TopHeaderProps {
  onToggleMobileMenu: () => void;
  onGlobalSearch?: (query: string) => void;
  onUploadClick?: () => void;
  onAiSparkleClick?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onToggleMobileMenu,
  onGlobalSearch,
  onUploadClick,
  onAiSparkleClick,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  // Toast feedback state
  const [toast, setToast] = useState<{ show: boolean; message: string; type?: 'success' | 'info' }>({
    show: false,
    message: '',
    type: 'success',
  });

  const triggerToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3400);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (onGlobalSearch) onGlobalSearch(val);
  };

  const handleOpenUpload = () => {
    if (onUploadClick) {
      onUploadClick();
    }
    setIsUploadModalOpen(true);
  };

  const handleUploadSuccess = (msg: string) => {
    triggerToast(msg, 'success');
  };

  const handleNotifAction = (notif: NotificationItem) => {
    triggerToast(`Opening action for: "${notif.title}"`, 'info');
  };

  const handleAiSparkle = () => {
    if (onAiSparkleClick) {
      onAiSparkleClick();
    } else {
      triggerToast('AI Advisory: Plan B pricing re-calibration could recover ₹450K ARR.', 'info');
    }
  };

  return (
    <header className="top-header">
      {/* Left Area: Mobile hamburger + Upload + Global Search */}
      <div className="header-left">
        {/* Mobile menu trigger */}
        <button
          type="button"
          className="btn-mobile-menu"
          onClick={onToggleMobileMenu}
          aria-label="Open Mobile Menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Upload Button */}
        <button
          type="button"
          className="btn-upload"
          onClick={handleOpenUpload}
          title="Upload Dataset or Telemetry from PC"
          id="topHeaderUploadBtn"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span>Upload</span>
        </button>

        {/* Global Search */}
        <div className="global-search">
          <span className="global-search-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            className="global-search-input"
            placeholder="Search for anything"
            value={searchTerm}
            onChange={handleSearchChange}
            aria-label="Global Search"
          />
        </div>
      </div>

      {/* Right Area: AI Sparkle, Notification, Profile */}
      <div className="header-right">
        {/* AI Strategic Sparkle */}
        <button
          type="button"
          className="btn-ai-sparkle"
          onClick={handleAiSparkle}
          title="AI Strategic Assistant"
          aria-label="AI Assistant"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L14.2 8.8L21 11L14.2 13.2L12 20L9.8 13.2L3 11L9.8 8.8L12 2Z" fill="white" />
          </svg>
        </button>

        {/* Notifications Button & Responsive Flyout */}
        <div className="notifications-wrapper" style={{ position: 'relative' }}>
          <button
            type="button"
            className={`btn-icon-square ${isNotifDropdownOpen ? 'active' : ''}`}
            title={`Notifications (${unreadCount} unread)`}
            aria-label="Notifications"
            aria-expanded={isNotifDropdownOpen}
            aria-haspopup="true"
            id="notificationBellBtn"
            onClick={() => setIsNotifDropdownOpen((prev) => !prev)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && <span className="notification-badge-dot" />}
          </button>

          {/* Active Notification Flyout */}
          <NotificationDropdown
            isOpen={isNotifDropdownOpen}
            onClose={() => setIsNotifDropdownOpen(false)}
            unreadCount={unreadCount}
            onUnreadCountChange={setUnreadCount}
            onSelectAction={handleNotifAction}
          />
        </div>

        {/* Profile Avatar */}
        <div className="profile-avatar-wrap" title="Alciya Anand Dodti — Head of Advisory & Analytics">
          <img
            className="profile-avatar-img"
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
            alt="Alciya Profile"
          />
          <span className="profile-status-indicator" title="Online" />
        </div>
      </div>

      {/* PC / Browse File Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Header Toast Notification */}
      <Toast show={toast.show} message={toast.message} type={toast.type} />
    </header>
  );
};
