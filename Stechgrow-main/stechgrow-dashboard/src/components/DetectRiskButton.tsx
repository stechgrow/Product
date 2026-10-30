import type { ButtonHTMLAttributes } from 'react';

export interface DetectRiskButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  onDetectRisk?: () => void;
}

export default function DetectRiskButton({
  className = '',
  onClick,
  onDetectRisk,
  disabled,
  ...props
}: DetectRiskButtonProps) {
  return (
    <button
      type="button"
      onClick={onDetectRisk || onClick}
      disabled={disabled}
      aria-label="Detect Risk"
      className={`w-[268px] h-[62px] bg-white rounded-[10px] flex items-center justify-center gap-3.5 select-none text-[#111111] font-semibold text-[20px] transition-all hover:bg-zinc-100 hover:shadow-lg active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6200FF] disabled:opacity-50 disabled:pointer-events-none ${className}`}
      {...props}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="shrink-0"
      >
        <path d="M12 3a1 1 0 0 1 1 1v6.268l5.428-3.134a1 1 0 0 1 1 1.732L14 12l5.428 3.134a1 1 0 1 1-1 1.732L13 13.732V20a1 1 0 1 1-2 0v-6.268l-5.428 3.134a1 1 0 1 1-1-1.732L10 12L4.572 8.866a1 1 0 0 1 1-1.732L11 10.268V4a1 1 0 0 1 1-1" />
      </svg>
      <span>Detect Risk</span>
    </button>
  );
}
