'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeNavItem?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activeNavItem = 'advisory',
}) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* Responsive Left Sidebar */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        activeItem={activeNavItem}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <TopHeader
          onToggleMobileMenu={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />
        <main>{children}</main>
      </div>
    </div>
  );
};
