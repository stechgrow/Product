'use client';

import React from 'react';

interface ToastProps {
  message: string;
  show: boolean;
  type?: 'success' | 'info' | 'warning';
}

export const Toast: React.FC<ToastProps> = ({ message, show, type = 'success' }) => {
  return (
    <div className={`toast-notice ${show ? 'show' : ''}`} role="alert" aria-live="assertive">
      {type === 'success' ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2EFF9A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6200FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      )}
      <span>{message}</span>
    </div>
  );
};
