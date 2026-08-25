import React from 'react'

interface ScreenIndicatorProps {
  label?: string
  className?: string
}

export const ScreenIndicator: React.FC<ScreenIndicatorProps> = ({
  label = 'MÀN HÌNH',
  className = '',
}) => {
  return (
    <div className={`relative flex flex-col items-center justify-center w-full max-w-3xl mx-auto my-6 select-none ${className}`}>
      {/* Ambient Glow Gradient hắt sáng xuống các hàng ghế sử dụng token */}
      <div 
        className="absolute -top-4 w-full h-24 bg-[radial-gradient(ellipse_at_top,var(--rogym-border-teal-hover),var(--rogym-border-teal-dim)_40%,transparent_75%)] pointer-events-none"
        aria-hidden="true"
      />

      {/* Thanh vòm màn hình cong (Curved Screen Arc) */}
      <div className="relative w-full overflow-hidden flex flex-col items-center">
        <svg
          viewBox="0 0 800 60"
          className="w-full h-10 sm:h-12 text-[var(--rogym-teal)] [filter:drop-shadow(0_4px_16px_var(--rogym-shadow-tone-sm))]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Đường cong viền phát sáng */}
          <path
            d="M 20 45 Q 400 5 780 45"
            stroke="url(#screen-glow-gradient)"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Đường phản quang mờ bên dưới */}
          <path
            d="M 40 47 Q 400 9 760 47"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeOpacity="0.4"
          />
          <defs>
            <linearGradient id="screen-glow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--rogym-green)" stopOpacity="0.3" />
              <stop offset="25%" stopColor="var(--rogym-teal)" stopOpacity="0.9" />
              <stop offset="50%" stopColor="var(--rogym-text-primary)" stopOpacity="1" />
              <stop offset="75%" stopColor="var(--rogym-teal)" stopOpacity="0.9" />
              <stop offset="100%" stopColor="var(--rogym-green)" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </svg>


        {/* Chữ MÀN HÌNH / SCREEN */}
        <div className="flex items-center gap-2 mt-[-4px]">
          <span className="text-[11px] sm:text-xs font-bold tracking-[0.4em] uppercase text-[var(--rogym-text-muted)] drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            {label}
          </span>
        </div>
      </div>
    </div>
  )
}
