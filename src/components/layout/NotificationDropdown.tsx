'use client';

import React, { useState, useEffect, useRef } from 'react';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'Revenue' | 'Data Quality' | 'Reports' | 'System';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  time: string;
  isRead: boolean;
  actionText?: string;
}

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  unreadCount: number;
  onUnreadCountChange: (count: number) => void;
  onSelectAction?: (notification: NotificationItem) => void;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Revenue Drop in Plan B',
    message: '15% quarterly revenue decline detected. Segment B churn increased by 22%. Immediate retention review required.',
    category: 'Revenue',
    priority: 'Critical',
    time: '10m ago',
    isRead: false,
    actionText: 'Review Advisory',
  },
  {
    id: 'notif-2',
    title: 'Data Quality Ingestion Cleaned',
    message: '275 missing transaction records filled; 14 duplicates merged. Forecast accuracy restored by +8-12%.',
    category: 'Data Quality',
    priority: 'High',
    time: '45m ago',
    isRead: false,
    actionText: 'View Telemetry',
  },
  {
    id: 'notif-3',
    title: 'Executive Advisory Synthesis Q4',
    message: 'Q4 Synthesis report generated with ₹1.2M projected financial upside ready for board review.',
    category: 'Reports',
    priority: 'Medium',
    time: '2h ago',
    isRead: false,
    actionText: 'Download PDF',
  },
  {
    id: 'notif-4',
    title: 'Cloud Cluster Auto-Scale Triggered',
    message: 'Automated off-peak compute scale-down saved 38 idle compute vCPU hours in ap-south-1 cluster.',
    category: 'System',
    priority: 'Low',
    time: '5h ago',
    isRead: true,
    actionText: 'Cluster Logs',
  },
];

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  onUnreadCountChange,
  onSelectAction,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<'all' | 'critical' | 'system'>('all');
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Sync unread count to parent
  useEffect(() => {
    const unread = notifications.filter((n) => !n.isRead).length;
    onUnreadCountChange(unread);
  }, [notifications, onUnreadCountChange]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // ESC key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const toggleReadStatus = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'critical') return n.priority === 'Critical' || n.priority === 'High';
    if (activeTab === 'system') return n.category === 'System' || n.category === 'Data Quality';
    return true;
  });

  const unreadTotal = notifications.filter((n) => !n.isRead).length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'var(--c-red)';
      case 'High':
        return 'var(--c-orange)';
      case 'Medium':
        return 'var(--c-yellow)';
      case 'Low':
        return 'var(--c-blue)';
      default:
        return 'var(--c-green)';
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="notifications-flyout-panel"
      role="region"
      aria-label="Notifications panel"
    >
      {/* Header */}
      <div className="notif-header">
        <div className="notif-title-row">
          <div className="notif-title-wrap">
            <h4 className="notif-title">Notifications</h4>
            {unreadTotal > 0 && (
              <span className="notif-unread-badge">{unreadTotal} new</span>
            )}
          </div>

          <div className="notif-header-actions">
            {unreadTotal > 0 && (
              <button
                type="button"
                className="btn-mark-all-read"
                onClick={markAllAsRead}
                title="Mark all notifications as read"
              >
                Mark all read
              </button>
            )}
            <button
              type="button"
              className="btn-close-notif-flyout"
              onClick={onClose}
              aria-label="Close notifications"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="notif-tabs-bar">
          <button
            type="button"
            className={`notif-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All ({notifications.length})
          </button>
          <button
            type="button"
            className={`notif-tab-btn ${activeTab === 'critical' ? 'active' : ''}`}
            onClick={() => setActiveTab('critical')}
          >
            Critical Alerts ({notifications.filter((n) => n.priority === 'Critical' || n.priority === 'High').length})
          </button>
          <button
            type="button"
            className={`notif-tab-btn ${activeTab === 'system' ? 'active' : ''}`}
            onClick={() => setActiveTab('system')}
          >
            System
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="notif-list-container">
        {filteredNotifications.length > 0 ? (
          <ul className="notif-list" role="list">
            {filteredNotifications.map((item) => (
              <li
                key={item.id}
                className={`notif-item ${!item.isRead ? 'unread' : ''}`}
                onClick={() => toggleReadStatus(item.id)}
                role="listitem"
              >
                <div className="notif-item-top">
                  <div className="notif-item-badges">
                    <span
                      className="notif-priority-indicator"
                      style={{ backgroundColor: getPriorityColor(item.priority) }}
                      title={`${item.priority} Priority`}
                    />
                    <span className="notif-category-tag">{item.category}</span>
                  </div>
                  <div className="notif-meta-right">
                    <span className="notif-time-ago">{item.time}</span>
                    {!item.isRead && <span className="notif-unread-dot" title="Unread" />}
                  </div>
                </div>

                <h5 className="notif-item-title">{item.title}</h5>
                <p className="notif-item-msg">{item.message}</p>

                {item.actionText && (
                  <div className="notif-item-actions">
                    <button
                      type="button"
                      className="notif-action-link"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectAction) onSelectAction(item);
                        onClose();
                      }}
                    >
                      <span>{item.actionText}</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="notif-empty-state">
            <div className="notif-empty-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <p className="notif-empty-text">You're all caught up!</p>
            <span className="notif-empty-subtext">No new telemetry alerts or notifications</span>
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="notif-footer">
          <button
            type="button"
            className="btn-clear-all-notifs"
            onClick={clearAllNotifications}
          >
            Clear all notifications
          </button>
        </div>
      )}
    </div>
  );
};
