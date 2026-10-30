import { useRef, type ButtonHTMLAttributes, type ChangeEvent, type MouseEvent } from 'react';

export interface UploadCardProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onFilesSelected?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
}

export default function UploadCard({
  className = '',
  onFilesSelected,
  accept,
  multiple = false,
  onClick,
  ...props
}: UploadCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    fileInputRef.current?.click();
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      onFilesSelected?.(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
        tabIndex={-1}
      />
      <button
        type="button"
        onClick={handleClick}
        aria-label="Upload files"
        className={`w-[170px] h-[86px] bg-[#1E1E1E] rounded-[20px] border border-white/5 shadow-md flex items-center px-[26px] gap-[30px] text-white hover:bg-[#252525] active:scale-95 transition-all select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6200FF]/40 ${className}`}
        {...props}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 text-white"
        >
          <path
            d="M2.25 17C2.25 19.3472 4.15279 21.25 6.5 21.25H17.5C19.8472 21.25 21.75 19.3472 21.75 17V12.75C21.75 10.4028 19.8472 8.5 17.5 8.5H17C16.5858 8.5 16.25 8.83578 16.25 9.25C16.25 9.66421 16.5858 9.99998 17 9.99998H17.5C19.0188 9.99998 20.25 11.2312 20.25 12.75V17C20.25 18.5188 19.0188 19.75 17.5 19.75H6.5C4.98122 19.75 3.75 18.5188 3.75 17V12.75C3.75 11.2312 4.98122 9.99998 6.5 9.99998H7C7.41421 9.99998 7.75 9.66421 7.75 9.25C7.75 8.83578 7.41421 8.5 7 8.5H6.5C4.15279 8.5 2.25 10.4028 2.25 12.75V17Z"
            fill="currentColor"
          />
          <path
            d="M8.51825 6.82481C8.2008 6.55874 8.15914 6.0857 8.42521 5.76824L10.6346 3.1322C11.341 2.28927 12.6583 2.28927 13.3648 3.1322L15.5748 5.76815C15.8409 6.08557 15.7993 6.55862 15.4819 6.82474C15.1644 7.09085 14.6914 7.04927 14.4253 6.73185L12.75 4.73361V14.75C12.75 15.1642 12.4142 15.5 12 15.5C11.5858 15.5 11.25 15.1642 11.25 14.75V4.73306L9.57483 6.73176C9.30875 7.04922 8.83571 7.09088 8.51825 6.82481Z"
            fill="currentColor"
          />
        </svg>

        <span className="text-[20px] font-medium text-white whitespace-nowrap">
          Upload
        </span>
      </button>
    </>
  );
}
