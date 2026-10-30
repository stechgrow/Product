import type { ButtonHTMLAttributes } from 'react';
import InfoButton from './InfoButton';

export interface ActionToolbarProps {
  className?: string;
  onFilterClick?: () => void;
  onSortClick?: () => void;
  onRefreshClick?: () => void;
  onInfoClick?: () => void;
}

const btnClass =
  'w-[62px] h-[62px] bg-[#1E1E1E] rounded-[10px] flex items-center justify-center shrink-0 text-white transition-all hover:bg-[#2A2A2A] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6200FF]';

export function SlidersButton({
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label="Filter"
      className={`${btnClass} ${className}`}
      {...props}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="shrink-0"
      >
        <path d="M3 7H12M18 7H21" />
        <circle cx="15" cy="7" r="3" />
        <path d="M3 17H6M12 17H21" />
        <circle cx="9" cy="17" r="3" />
      </svg>
    </button>
  );
}

export function SortButton({
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label="Sort"
      className={`${btnClass} ${className}`}
      {...props}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="shrink-0"
      >
        <path opacity="0.45" d="M20 6H14" />
        <path opacity="0.45" d="M20 12H4" />
        <path d="M20 18H10" />
      </svg>
    </button>
  );
}

export function RefreshButton({
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label="Refresh"
      className={`${btnClass} ${className}`}
      {...props}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="shrink-0"
      >
        <path d="M1.28 0h6.42v6.42H6.42V1.93C3.4 3.17 1.28 6.15 1.28 9.63c0 4.6 3.74 8.35 8.35 8.35a8.35 8.35 0 0 0 5.9-14.25v-1.32A9.63 9.63 0 1 1 0 9.63C0 6.06 1.93 2.95 4.8 1.28H1.28V0Z" />
      </svg>
    </button>
  );
}

export default function ActionToolbar({
  className = '',
  onFilterClick,
  onSortClick,
  onRefreshClick,
  onInfoClick,
}: ActionToolbarProps) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <SlidersButton onClick={onFilterClick} />
      <SortButton onClick={onSortClick} />
      <RefreshButton onClick={onRefreshClick} />
      <InfoButton onInfoClick={onInfoClick} />
    </div>
  );
}
