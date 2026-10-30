import type { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  className?: string;
}

export default function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`bg-[#1E1E1E] rounded-[20px] border border-white/5 shadow-xl ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
