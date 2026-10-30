import { useState, type ChangeEvent } from 'react';

export interface TopSearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export default function TopSearchBar({
  placeholder = 'Search for anything',
  value,
  onChange,
  className = '',
}: TopSearchBarProps) {
  const [internalVal, setInternalVal] = useState('');
  const currentValue = value !== undefined ? value : internalVal;

  return (
    <div
      className={`w-[496px] h-[86px] bg-[#1E1E1E] rounded-[20px] shadow-md border border-white/5 flex items-center px-6 gap-4 select-none ${className}`}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="shrink-0 text-white"
      >
        <path
          d="M1.21 10.19a8.98 8.98 0 1 1 17.96 0 8.98 8.98 0 0 1-17.96 0Zm8.98-7.52a7.52 7.52 0 1 0 0 15.05 7.52 7.52 0 0 0 0-15.05Z"
          fillRule="evenodd"
          clipRule="evenodd"
        />
        <path d="M19.25 21.33c-.55-.07-1.06-.37-1.37-.89l-1.06-1.77c-.32-.53-.24-1.21.2-1.65.28-.29.67-.42 1.05-.39.21.01.41.07.6.19l1.77 1.06a1.9 1.9 0 0 1 .36 2.92c-.37.37-.85.55-1.33.54-.07 0-.15 0-.22-.01Z" />
      </svg>

      <input
        type="text"
        placeholder={placeholder}
        value={currentValue}
        onChange={onChange || ((e) => setInternalVal(e.target.value))}
        className="flex-1 bg-transparent text-[20px] font-medium text-white placeholder-zinc-400 outline-none"
      />
    </div>
  );
}
