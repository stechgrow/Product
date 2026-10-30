import type { ButtonHTMLAttributes } from 'react';

export interface ProfileAvatarProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  avatarUrl?: string;
  isOnline?: boolean;
}

export default function ProfileAvatar({
  avatarUrl = '/avatar.png',
  isOnline = true,
  className = '',
  ...props
}: ProfileAvatarProps) {
  return (
    <button
      type="button"
      aria-label="User profile"
      className={`relative w-[86px] h-[86px] shrink-0 rounded-[20px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] border-[5px] border-[#1E1E1E] overflow-visible cursor-pointer hover:opacity-90 active:scale-95 transition-all focus:outline-none ${className}`}
      {...props}
    >
      <img
        src={avatarUrl}
        alt="Profile"
        className="w-full h-full rounded-[15px] object-cover"
      />
      {isOnline && (
        <span
          className="absolute -bottom-1 -right-1 w-[18px] h-[18px] bg-[#9AFF2E] rounded-full ring-2 ring-[#1E1E1E]"
          aria-hidden="true"
        />
      )}
    </button>
  );
}
