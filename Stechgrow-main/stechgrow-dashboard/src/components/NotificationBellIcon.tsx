import type { SVGProps } from 'react';

export default function NotificationBellIcon({
  size = 24,
  className = '',
  ...props
}: SVGProps<SVGSVGElement> & { size?: number | string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M12 2.87C9.35 2.87 7.2 4.95 7.2 7.6C7.2 8.75 7.15 9.8 6.95 10.6C6.6 12.05 4.43 13.5 4.43 15.2C4.43 16.8 6.1 17.55 8 17.75C9.3 17.9 10.65 17.95 12 17.95C13.35 17.95 14.7 17.9 16 17.75C17.9 17.55 19.57 16.8 19.57 15.2C19.57 13.5 17.4 12.05 17.05 10.6C16.85 9.8 16.8 8.75 16.8 7.6C16.8 4.95 14.65 2.87 12 2.87Z" />
      <path d="M9.4 19.6C9.8 20.5 10.8 21.13 12 21.13C13.2 21.13 14.2 20.5 14.6 19.6" />
    </svg>
  );
}
