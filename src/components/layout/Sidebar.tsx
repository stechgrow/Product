'use client';

import React, { useState } from 'react';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  activeItem?: string;
  onNavigate?: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen,
  onCloseMobile,
  activeItem = 'advisory',
  onNavigate,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentActive, setCurrentActive] = useState(activeItem);
  const [searchQuery, setSearchQuery] = useState('');

  const handleItemClick = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentActive(id);
    if (onNavigate) onNavigate(id);
    if (isMobileOpen) onCloseMobile();
  };

  const navItemsTop = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="18" rx="2" />
          <rect x="14" y="3" width="7" height="18" rx="2" />
        </svg>
      ),
    },
    {
      id: 'eda',
      label: 'Exploratory Data Analysis',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22a10 10 0 1 1 10-10" />
          <path d="M12 6v6l4 2" />
          <path d="M22 6l-3-3-3 3" />
          <path d="M19 3v8" />
        </svg>
      ),
    },
    {
      id: 'data-analysis',
      label: 'Data Analysis',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <polyline points="12 6 12 12 15 15" />
          <path d="M17 9l3-3" />
        </svg>
      ),
    },
    {
      id: 'risk-health',
      label: 'Risk Detection & Health',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="2" x2="12" y2="22" />
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <line x1="4.93" y1="19.07" x2="19.07" y2="4.93" />
        </svg>
      ),
    },
    {
      id: 'advisory',
      label: 'Advisory Recommendation',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <polyline points="8 12 11 15 16 9" />
        </svg>
      ),
    },
    {
      id: 'report',
      label: 'Report',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
    },
    {
      id: 'employee',
      label: 'Employee Dashboard',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
          <path d="M9 21V9" />
        </svg>
      ),
    },
  ];

  const navItemsBottom = [
    {
      id: 'preferences',
      label: 'Preferences',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="7" x2="20" y2="7" />
          <circle cx="9" cy="7" r="2.2" fill="currentColor" />
          <line x1="4" y1="17" x2="20" y2="17" />
          <circle cx="15" cy="17" r="2.2" fill="currentColor" />
        </svg>
      ),
    },
    {
      id: 'theme',
      label: 'Theme',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a10 10 0 0 0-10 10c0 4.42 3.58 8 8 8h1a2 2 0 0 0 2-2v-1a2 2 0 0 1 2-2h1a5 5 0 0 0 5-5c0-4.42-4.03-8-9-8z" />
          <circle cx="7.5" cy="9.5" r="1.5" fill="currentColor" />
          <circle cx="12" cy="6.5" r="1.5" fill="currentColor" />
          <circle cx="16.5" cy="9.5" r="1.5" fill="currentColor" />
        </svg>
      ),
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
        </svg>
      ),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      <div
        className={`mobile-sidebar-backdrop ${isMobileOpen ? 'active' : ''}`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      {/* Main Sidebar */}
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        {/* Top Card: Brand & Search */}
        <div className="sidebar-top-card">
          <div className="brand-row">
            <div className="brand-info">
              <div className="brand-logo-icon" aria-label="Stechgrow Logo">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="24">
                  <path
                    d="M16.5 7.5C16.5 5.57 14.93 4 13 4H8C5.79 4 4 5.79 4 8C4 10.21 5.79 12 8 12H16C18.21 12 20 13.79 20 16C20 18.21 18.21 20 16 20H9C7.07 20 5.5 18.43 5.5 16.5"
                    stroke="#FFFFFF"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <span className="brand-name">Stechgrow</span>
            </div>

            {/* Collapse button */}
            <button
              type="button"
              className="sidebar-collapse-btn"
              onClick={() => setIsCollapsed(!isCollapsed)}
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              aria-label="Toggle Sidebar Collapse"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="4" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
            </button>
          </div>

          {/* AI Quick Search */}
          <div className="sidebar-search">
            <span className="sidebar-search-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              className="sidebar-search-input"
              placeholder="AI Quick Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="AI Quick Search"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav" aria-label="Main Navigation">
          <div className="nav-group-top">
            {navItemsTop.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`nav-item ${currentActive === item.id ? 'active' : ''}`}
                onClick={(e) => handleItemClick(item.id, e)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.label}</span>
              </a>
            ))}
          </div>

          <div className="nav-group-bottom">
            {navItemsBottom.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`nav-item ${currentActive === item.id ? 'active' : ''}`}
                onClick={(e) => handleItemClick(item.id, e)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.label}</span>
              </a>
            ))}
          </div>
        </nav>
      </aside>
    </>
  );
};
