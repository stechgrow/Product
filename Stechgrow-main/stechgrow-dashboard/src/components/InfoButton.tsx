import type { ButtonHTMLAttributes } from 'react';

export interface InfoButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onInfoClick?: () => void;
}

export default function InfoButton({
  className = '',
  onClick,
  onInfoClick,
  ...props
}: InfoButtonProps) {
  return (
    <button
      type="button"
      onClick={onInfoClick || onClick}
      aria-label="Information"
      className={`w-[62px] h-[62px] bg-[#1E1E1E] rounded-[10px] flex items-center justify-center shrink-0 text-white transition-all hover:bg-[#2A2A2A] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6200FF] ${className}`}
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
        strokeLinejoin="round"
        className="shrink-0"
      >
        <path d="M12 8h.01M12 16v-5m10 1c0 5.523-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2s10 4.477 10 10" />
      </svg>
    </button>
  );
}
