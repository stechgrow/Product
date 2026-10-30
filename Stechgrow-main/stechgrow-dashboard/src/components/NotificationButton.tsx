import type { ButtonHTMLAttributes } from 'react';
import NotificationBellIcon from './NotificationBellIcon';

export interface NotificationButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  hasUnread?: boolean;
}

export default function NotificationButton({
  className = '',
  hasUnread = false,
  ...props
}: NotificationButtonProps) {
  return (
    <button
      type="button"
      aria-label="Notifications"
      className={`relative w-[86px] h-[86px] shrink-0 bg-[#1E1E1E] rounded-[20px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] border border-white/5 flex items-center justify-center text-white hover:bg-[#252525] active:scale-95 transition-all select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6200FF]/40 ${className}`}
      {...props}
    >
      <NotificationBellIcon size={24} className="pointer-events-none" />
      {hasUnread && (
        <span
          className="absolute top-[24px] right-[24px] w-[9px] h-[9px] bg-[#6200FF] rounded-full ring-2 ring-[#1E1E1E]"
          aria-hidden="true"
        />
      )}
    </button>
  );
}
