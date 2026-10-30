import type { ChangeEvent } from 'react';

export interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export default function SearchInput({
  placeholder = 'AI Quick Search',
  value,
  onChange,
  className = '',
}: SearchInputProps) {
  return (
    <div
      className={`w-[320px] h-[60px] bg-[#2C2C2C] rounded-[10px] px-[7px] flex items-center gap-3.5 border border-white/5 select-none ${className}`}
    >
      <div className="w-[48px] h-[45px] rounded bg-[#1E1E1E] flex items-center justify-center shrink-0">
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="currentColor"
          className="text-white"
        >
          <path
            d="M0.93 7.79a6.86 6.86 0 1 1 13.72 0 6.86 6.86 0 0 1-13.72 0Zm6.86-5.75a5.75 5.75 0 1 0 0 11.49 5.75 5.75 0 0 0 0-11.49Z"
            fillRule="evenodd"
            clipRule="evenodd"
          />
          <path d="M14.7 16.29c-.42-.05-.81-.29-1.05-.68l-.81-1.35c-.24-.41-.18-.93.16-1.26.21-.22.51-.32.8-.3.16.01.31.06.45.14l1.35.81c.8.48.93 1.58.28 2.23-.29.28-.65.42-1.02.42-.06 0-.11 0-.16-.01Z" />
        </svg>
      </div>

      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="flex-1 bg-transparent text-[18px] font-medium text-white placeholder-zinc-400 outline-none"
      />
    </div>
  );
}
