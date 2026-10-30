import type { ButtonHTMLAttributes } from 'react';

export interface AiButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export default function AiButton({ className = '', ...props }: AiButtonProps) {
  return (
    <button
      type="button"
      aria-label="AI Assistant"
      className={`w-[86px] h-[86px] shrink-0 rounded-[20px] bg-gradient-to-br from-[#6200FF] to-[#F78434] shadow-md flex items-center justify-center hover:opacity-90 active:scale-95 transition-all cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-[#6200FF]/40 ${className}`}
      {...props}
    >
      <svg
        width="30"
        height="30"
        viewBox="32 28 30 30"
        fill="currentColor"
        className="text-white shrink-0 pointer-events-none"
      >
        <path d="M56.54 38.76l-.27.62c-.04.1-.11.19-.2.25a.55.55 0 0 1-.62 0 .5.5 0 0 1-.2-.25l-.27-.62a3.86 3.86 0 0 0-2.43-2.46l-.83-.37c-.1-.05-.19-.12-.25-.22a.57.57 0 0 1 0-.62c.06-.1.15-.17.25-.22l.79-.35a3.88 3.88 0 0 0 2.46-2.55l.28-.67c.04-.1.11-.19.2-.25a.55.55 0 0 1 .62 0c.09.06.16.15.2.25l.28.67a3.88 3.88 0 0 0 2.46 2.55l.79.35c.1.05.19.12.24.22a.57.57 0 0 1 0 .62.58.58 0 0 1-.24.22l-.83.37a3.86 3.86 0 0 0-2.44 2.46ZM44.81 33.14h4.38v2.19h-4.38c-1.74 0-3.41.69-4.65 1.93a6.56 6.56 0 0 0-1.92 4.64c0 3.96 2.7 6.54 8.76 9.3v-2.72h2.19c1.74 0 3.42-.69 4.65-1.92a6.57 6.57 0 0 0 1.92-4.65h2.19c0 2.33-.92 4.56-2.57 6.2a8.77 8.77 0 0 1-6.2 2.57v3.83c-5.48-2.19-13.14-5.48-13.14-12.6 0-2.32.92-4.55 2.57-6.2a8.76 8.76 0 0 1 6.2-2.56Z" />
      </svg>
    </button>
  );
}
