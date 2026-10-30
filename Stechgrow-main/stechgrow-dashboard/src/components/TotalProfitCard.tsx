import type { HTMLAttributes } from 'react';
import StatCard from './StatCard';

export interface TotalProfitCardProps extends HTMLAttributes<HTMLDivElement> {
  count?: number | string;
  label?: string;
}

export default function TotalProfitCard({
  count = '15 M',
  label = 'Total Profit',
  ...props
}: TotalProfitCardProps) {
  return (
    <StatCard
      label={label}
      count={count}
      icon={
        <svg
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white shrink-0"
        >
          <path d="M3 5v14a2 2 0 0 0 2 2h16" />
          <path d="M7 14.5l4-4 3.5 3.5 5.5-5.5" />
          <path d="M15.5 8.5h4.5v4.5" />
        </svg>
      }
      {...props}
    />
  );
}
