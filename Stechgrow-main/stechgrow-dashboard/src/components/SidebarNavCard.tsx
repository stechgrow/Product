import type { ReactNode } from 'react';

interface NavItemProps {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  icon: ReactNode;
  isCollapsed?: boolean;
}

export function NavItem({
  label,
  isActive = false,
  onClick,
  icon,
  isCollapsed = false,
}: NavItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`group flex items-center ${
        isCollapsed
          ? 'justify-center w-12 h-12 rounded-[10px] mx-auto'
          : 'gap-[30px] text-left w-full'
      } transition-all duration-200 select-none cursor-pointer ${
        isActive
          ? isCollapsed
            ? 'bg-white/10 text-white shadow-sm'
            : 'text-white'
          : 'text-[#8E8E93] hover:text-white'
      }`}
    >
      <span className="w-7 h-7 flex items-center justify-center shrink-0 text-current transition-transform duration-200 group-hover:scale-110">
        {icon}
      </span>

      {!isCollapsed && (
        <span
          className={`inline-flex items-center text-[20px] font-medium whitespace-nowrap transition-colors ${
            isActive ? 'text-white' : 'text-[#8E8E93] group-hover:text-white'
          }`}
        >
          {label}
        </span>
      )}
    </button>
  );
}

export interface SidebarNavCardProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  isCollapsed?: boolean;
}

export default function SidebarNavCard({
  activeTab = 'Dashboard',
  onTabChange,
  isCollapsed = false,
}: SidebarNavCardProps) {
  return (
    <div
      className={`${
        isCollapsed ? 'w-[84px] px-2 items-center' : 'w-[360px] pl-[34px] pr-6'
      } h-[828px] bg-[#1E1E1E] rounded-[20px] pt-[30px] pb-[32px] flex flex-col justify-between border border-white/5 shadow-xl select-none shrink-0 transition-all duration-300`}
    >
      <div className={`flex flex-col gap-[38px] ${isCollapsed ? 'w-full items-center' : 'w-full'}`}>
        <NavItem
          label="Dashboard"
          isActive={activeTab === 'Dashboard'}
          onClick={() => onTabChange?.('Dashboard')}
          isCollapsed={isCollapsed}
          icon={
            <svg width="27" height="27" viewBox="0 0 28 28" fill="none" className="shrink-0">
              <path
                d="M13.52 23.67V3.38M13.52 11.27h10.15M6.09 3.38h14.87c.72 0 1.41.29 1.91.79.51.51.8 1.2.8 1.91v14.88c0 .72-.29 1.4-.8 1.91-.5.51-1.19.8-1.91.8H6.09c-.72 0-1.4-.29-1.91-.8a2.7 2.7 0 0 1-.79-1.91V6.08c0-.71.28-1.4.79-1.91.5-.5 1.19-.79 1.91-.79Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        />

        <NavItem
          label="Exploratory Data Analysis"
          isActive={activeTab === 'Exploratory Data Analysis'}
          onClick={() => onTabChange?.('Exploratory Data Analysis')}
          isCollapsed={isCollapsed}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <path
                d="M14.35 10.54l-3.37 4.36a.8.8 0 0 1-1.15.21l-2.23-1.39a.78.78 0 0 0-1.1.14L3.39 17.09M15 2.46c-.95-.3-1.95-.46-3-.46-5.52 0-10 4.48-10 10 0 2.99 1.31 5.67 3.39 7.5M21.57 9.1A9.97 9.97 0 0 1 22 12c0 5.52-4.48 10-10 10-1.09 0-2.15-.18-3.13-.5M21 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM15.17 13.82l-.26-3a.8.8 0 0 0-1.14-.79l-2.9.78"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        />

        <NavItem
          label="Data Analysis"
          isActive={activeTab === 'Data Analysis'}
          onClick={() => onTabChange?.('Data Analysis')}
          isCollapsed={isCollapsed}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <path
                opacity="0.45"
                d="M14.35 10.54l-3.37 4.36a.8.8 0 0 1-1.15.21l-2.23-1.39a.78.78 0 0 0-1.1.14L3.39 17.09"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15 2.46c-.95-.3-1.95-.46-3-.46-5.52 0-10 4.48-10 10 0 5.52 4.48 10 10 10s10-4.48 10-10c0-1.01-.15-1.99-.43-2.9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                opacity="0.45"
                d="M21 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M15.17 13.82l-.26-3a.8.8 0 0 0-1.14-.79l-2.9.78"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        />

        <NavItem
          label="Risk Detection & Health"
          isActive={activeTab === 'Risk Detection & Health'}
          onClick={() => onTabChange?.('Risk Detection & Health')}
          isCollapsed={isCollapsed}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
              <path d="M12 3a1 1 0 0 1 1 1v6.27l5.43-3.14a1 1 0 1 1 1 1.73L14 12l5.43 3.13a1 1 0 1 1-1 1.74L13 13.73V20a1 1 0 1 1-2 0v-6.27l-5.43 3.14a1 1 0 1 1-1-1.74L10 12 4.57 8.87a1 1 0 1 1 1-1.74L11 10.27V4a1 1 0 0 1 1-1Z" />
            </svg>
          }
        />

        <NavItem
          label="Advisory Recommendation"
          isActive={activeTab === 'Advisory Recommendation'}
          onClick={() => onTabChange?.('Advisory Recommendation')}
          isCollapsed={isCollapsed}
          icon={
            <svg width="23" height="23" viewBox="0 0 23 23" fill="currentColor" className="shrink-0">
              <path d="M11.5 0a11.5 11.5 0 1 0 0 23 11.5 11.5 0 0 0 0-23Zm0 21.59a10.09 10.09 0 1 1 0-20.17 10.09 10.09 0 0 1 0 20.17Zm4.59-14.3-6.75 6.79-3.04-3.04a.55.55 0 0 0-.77 0 .55.55 0 0 0 0 .78l3.55 3.56c.28.28.74.28 1.02 0l7.16-7.2a.55.55 0 0 0 0-.78.55.55 0 0 0-.77 0Z" />
            </svg>
          }
        />

        <NavItem
          label="Report"
          isActive={activeTab === 'Report'}
          onClick={() => onTabChange?.('Report')}
          isCollapsed={isCollapsed}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <path d="M20.5 12v6.5a3.5 3.5 0 0 1-3.5 3.5H7.5A3 3 0 0 1 4.5 19" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8.36 3.5H7.6A3.11 3.11 0 0 0 4.5 7.38V9.6c.12 5.62-.52 5.82-.95 7.05a2.6 2.6 0 0 0 1.9 2.36h11.16c1.82 0 3.95-1.9 3.89-6.25V7.38A3.11 3.11 0 0 0 17.39 3.5h-.78" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M8.5 3.5A1.5 1.5 0 0 1 10 2h5a1.5 1.5 0 0 1 1.5 1.5A1.5 1.5 0 0 1 15 5h-5a1.5 1.5 0 0 1-1.5-1.5ZM9.5 13.75h6M9.5 10.25H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          }
        />

        <NavItem
          label="Employee Dashboard"
          isActive={activeTab === 'Employee Dashboard'}
          onClick={() => onTabChange?.('Employee Dashboard')}
          isCollapsed={isCollapsed}
          icon={
            <svg width="27" height="27" viewBox="0 0 28 28" fill="none" className="shrink-0">
              <path
                d="M13.52 23.67V3.38M13.52 11.27h10.15M6.09 3.38h14.87c.72 0 1.41.29 1.91.79.51.51.8 1.2.8 1.91v14.88c0 .72-.29 1.4-.8 1.91-.5.51-1.19.8-1.91.8H6.09c-.72 0-1.4-.29-1.91-.8a2.7 2.7 0 0 1-.79-1.91V6.08c0-.71.28-1.4.79-1.91.5-.5 1.19-.79 1.91-.79Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        />
      </div>

      <div className={`flex flex-col gap-[38px] ${isCollapsed ? 'w-full items-center' : 'w-full'}`}>
        <NavItem
          label="Preferences"
          isActive={activeTab === 'Preferences'}
          onClick={() => onTabChange?.('Preferences')}
          isCollapsed={isCollapsed}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
              <path d="M3 6.25h8.33a3.75 3.75 0 0 1 7.35 0H21a.75.75 0 0 1 0 1.5h-2.32a3.75 3.75 0 0 1-7.35 0H3a.75.75 0 0 1 0-1.5Zm12-1.5a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5ZM3 16.25h2.33a3.75 3.75 0 0 1 7.35 0H21a.75.75 0 0 1 0 1.5h-8.32a3.75 3.75 0 0 1-7.35 0H3a.75.75 0 0 1 0-1.5Zm8.25.75a2.25 2.25 0 1 0-4.5 0 2.25 2.25 0 0 0 4.5 0Z" />
            </svg>
          }
        />

        <NavItem
          label="Theme"
          isActive={activeTab === 'Theme'}
          onClick={() => onTabChange?.('Theme')}
          isCollapsed={isCollapsed}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
              <path d="M4.22 4.72c3.76-3.76 10.24-3.1 14.45 1.11 2.41 2.42 3.65 5.54 3.58 8.48-.03 1.38-.72 2.56-1.74 3.1-.51.28-1.11.4-1.72.26-.6-.13-1.15-.5-1.6-1.06-.28-.36-.49-.63-.7-.82-.2-.18-.32-.21-.4-.21-.09 0-.12.02-.13.03-.02.01-.06.04-.11.14-.12.23-.21.59-.32 1.14-.1.47-.2.92-.37 1.45a5.55 5.55 0 0 1-1.02 1.78c-1.35 1.35-3.08 1.53-4.66 1.15-1.56-.38-3.05-1.33-4.11-2.4C1.35 14.9.68 8.48 4.22 4.72Zm13.39 2.18c-3.8-3.8-9.31-4.13-12.33-1.12-3.02 3.02-2.69 8.54 1.11 12.34.9.9 2.16 1.69 3.41 2 1.23.3 2.37.13 3.25-.74.3-.3.5-.7.65-1.19.14-.43.23-.88.32-1.35.1-.51.22-1.1.47-1.57.14-.25.33-.5.6-.68.28-.19.61-.27.96-.27.59 0 1.05.28 1.4.58.31.29.6.65.84.97.27.33.53.47.75.52.22.04.45.01.68-.12.48-.25.93-.9.95-1.82.06-2.5-1-5.23-3.15-7.37Z" />
            </svg>
          }
        />

        <NavItem
          label="Help & Support"
          isActive={activeTab === 'Help & Support'}
          onClick={() => onTabChange?.('Help & Support')}
          isCollapsed={isCollapsed}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
              <path d="M12 1.25a10.75 10.75 0 0 0-9.89 10.38c0 .82.1 1.62.29 2.38-.07.13-.13.27-.18.41l-.16.44a4.13 4.13 0 0 0 .56 3.75l2.2 2.98a4.13 4.13 0 0 0 3.42 1.64h.47c.5 0 .98-.17 1.38-.47a3.02 3.02 0 0 0 .53-4.27l-4.04-5.46a2.23 2.23 0 0 1-.32-2.1c.1-.42.34-.78.68-1.03a1.44 1.44 0 0 1 1.95.23l4.03 5.46a4.52 4.52 0 0 1-.8 6.4c-.4.3-.88.47-1.38.49l-.47.02a2.63 2.63 0 0 1-2.18-1.04l-2.2-2.98a2.63 2.63 0 0 1-.36-2.4l.16-.44c.06-.17.15-.33.24-.48A9.25 9.25 0 1 1 21.25 12c0 .82-.1 1.62-.29 2.38.07.13.13.27.18.41l.16.44a4.13 4.13 0 0 1-.56 3.75l-2.2 2.98a4.13 4.13 0 0 1-3.42 1.64h-.47a2.26 2.26 0 0 1-1.38-.47 3.02 3.02 0 0 1-.53-4.27l4.04-5.46a2.23 2.23 0 0 0 .32-2.1 1.45 1.45 0 0 0-.68-1.03 1.44 1.44 0 0 0-1.95.23l-4.03 5.46a4.52 4.52 0 0 0 .8 6.4c.4.3.88.47 1.38.49l.47.02a2.63 2.63 0 0 0 2.18-1.04l2.2-2.98a2.63 2.63 0 0 0 .36-2.4l-.16-.44a1.7 1.7 0 0 0-.24-.48A9.25 9.25 0 0 0 12 1.25Z" />
            </svg>
          }
        />

        <NavItem
          label="Settings"
          isActive={activeTab === 'Settings'}
          onClick={() => onTabChange?.('Settings')}
          isCollapsed={isCollapsed}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
              <path d="M12 8.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Zm0 1.5a2.25 2.25 0 1 1 0 4.5 2.25 2.25 0 0 1 0-4.5ZM11.33 1.63c-.92 0-1.94.35-2.4 1.28l-.81 1.57a1.47 1.47 0 0 1-.69.4l-1.71-.06c-1.09-.13-1.99.64-2.45 1.44L2.69 7.33c-.49.87-.54 1.93-.09 2.69l.95 1.52a1.47 1.47 0 0 1 0 1.62l-.93 1.42c-.6.9-.39 2 .07 2.81l.68 1.17c.57.81 1.45 1.38 2.34 1.38h.03l1.74-.06a1.47 1.47 0 0 1 .69.4l.82 1.58c.44.74 1.38 1.24 2.38 1.24h1.25c.92 0 1.93-.35 2.4-1.28l.81-1.57a1.47 1.47 0 0 1 .69-.4l1.71.06c1.09.13 1.99-.64 2.45-1.44l.58-1.06c.49-.86.35-1.93-.1-2.69l-.95-1.52a1.47 1.47 0 0 1 0-1.62l.93-1.42c.6-.9.39-2-.07-2.81l-.68-1.17c-.57-.81-1.45-1.38-2.34-1.38h-.03l-1.74.06a1.47 1.47 0 0 1-.69-.4l-.82-1.58c-.44-.74-1.38-1.24-2.37-1.24h-1.25Z" />
            </svg>
          }
        />
      </div>
    </div>
  );
}