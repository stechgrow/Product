import type { HTMLAttributes, ReactNode } from 'react';

export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  count: number | string;
  icon: ReactNode;
  className?: string;
}

export default function StatCard({
  label,
  count,
  icon,
  className = '',
  ...props
}: StatCardProps) {
  return (
    <div
      className={`w-full h-[92px] bg-[#1E1E1E] rounded-[10px] px-3 py-2.5 flex items-center justify-between shrink-0 select-none border border-white/5 shadow-md transition-all duration-200 hover:border-white/10 hover:bg-[#232323] group ${className}`}
      {...props}
    >
      <div className="flex items-center gap-3.5">
        <div className="w-[70px] h-[70px] bg-[#111111] rounded-[10px] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
          {icon}
        </div>
        <span className="font-medium text-[20px] text-white whitespace-nowrap">
          {label}
        </span>
      </div>

      <span className="text-[44px] text-white whitespace-nowrap pr-3">
        {count}
      </span>
    </div>
  );
}
