import Card from './Card';
import SearchInput from './SearchInput';

export interface SidebarTopCardProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  className?: string;
}

export default function SidebarTopCard({
  isCollapsed = false,
  onToggle,
  className = '',
}: SidebarTopCardProps) {
  return (
    <Card
      className={`${
        isCollapsed
          ? 'w-[84px] py-6 px-2 flex flex-col items-center justify-between'
          : 'w-[360px] p-6 flex flex-col justify-between'
      } h-[192px] select-none shrink-0 transition-all duration-300 ${className}`}
    >
      <div
        className={`flex items-center ${
          isCollapsed ? 'flex-col gap-4 w-full' : 'justify-between w-full'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 shrink-0" title="Stechgrow">
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
              <rect width="44" height="44" rx="9" fill="url(#stechgrow-brand-grad)" />
              <path
                d="M30.85 9.63c.09 0 .14.1.09.18L27.9 14.43a.08.08 0 0 1-.07.05H17.35a.08.08 0 0 0-.08.08v4.41c0 .04.02.08.05.1l2.62 1.68c.07.04.17-.01.17-.1l.01-3.24c0-.07.05-.12.12-.12h11.15c.07 0 .12.05.12.12l-.03 11.08c0 .04-.02.08-.06.1l-3.27 1.8-6.07 3.78a.04.04 0 0 1-.03 0l-6.33-3.79-3.25-1.81a.08.08 0 0 1-.04-.07v-5.32c0-.09.09-.14.16-.1l8.63 4.98a.1.1 0 0 0 .11 0l4.58-2.64a.07.07 0 0 1 .07 0l1.08 1.08c.07.07.19.02.19-.08v-3.87c0-.07-.05-.12-.11-.12h-3.88c-.1 0-.15.12-.08.19l1.05 1.05a.1.1 0 0 1 0 .13l-2.94 1.7a.1.1 0 0 1-.11 0l-8.74-5.04a.08.08 0 0 1-.04-.07v-5.93c0-.02.01-.04.02-.06l3.15-4.77a.08.08 0 0 1 .07-.04h15.2Z"
                fill="white"
              />
              <defs>
                <linearGradient id="stechgrow-brand-grad" x1="5.5" y1="4.5" x2="39.5" y2="44" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6200FF" />
                  <stop offset="1" stopColor="#3B0099" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {!isCollapsed && (
            <span className="text-white text-[21px] font-medium leading-none">
              Stechgrow
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onToggle}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`${
            isCollapsed
              ? 'w-9 h-9 rounded-lg bg-[#2C2C2C] text-white hover:bg-[#383838]'
              : 'w-7 h-7 text-zinc-400 hover:text-white'
          } flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0`}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 28 28"
            fill="none"
            className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
          >
            <path
              d="M13.52 23.67V3.38M13.52 11.27h10.15M6.09 3.38h14.87c.72 0 1.41.29 1.91.79.51.51.8 1.2.8 1.91v14.88c0 .72-.29 1.4-.8 1.91-.5.51-1.19.8-1.91.8H6.09c-.72 0-1.4-.29-1.91-.8a2.7 2.7 0 0 1-.79-1.91V6.08c0-.71.28-1.4.79-1.91.5-.5 1.19-.79 1.91-.79Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {!isCollapsed ? (
        <SearchInput />
      ) : (
        <button
          type="button"
          onClick={onToggle}
          aria-label="AI Quick Search"
          className="w-9 h-9 rounded-lg bg-[#2C2C2C] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#383838] transition-all cursor-pointer"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
            <path
              d="M0.93 7.79a6.86 6.86 0 1 1 13.72 0 6.86 6.86 0 0 1-13.72 0Zm6.86-5.75a5.75 5.75 0 1 0 0 11.49 5.75 5.75 0 0 0 0-11.49Z"
              fillRule="evenodd"
              clipRule="evenodd"
            />
            <path d="M14.7 16.29c-.42-.05-.81-.29-1.05-.68l-.81-1.35c-.24-.41-.18-.93.16-1.26.21-.22.51-.32.8-.3.16.01.31.06.45.14l1.35.81c.8.48.93 1.58.28 2.23-.29.28-.65.42-1.02.42-.06 0-.11 0-.16-.01Z" />
          </svg>
        </button>
      )}
    </Card>
  );
}
