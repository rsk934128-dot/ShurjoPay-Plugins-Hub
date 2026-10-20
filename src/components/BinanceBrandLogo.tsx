import React from 'react';

interface BinanceBrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const BinanceBrandLogo: React.FC<BinanceBrandLogoProps> = ({
  size = 'md',
  showText = false,
  className = ''
}) => {
  const sizeMap = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
    xl: 'w-12 h-12'
  };

  const textMap = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-2xl'
  };

  return (
    <div className={`inline-flex items-center gap-2 shrink-0 ${className}`}>
      {/* Official Binance Diamond SVG */}
      <svg
        className={`${sizeMap[size]} shrink-0`}
        viewBox="0 0 126 126"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Binance Logo"
      >
        <path
          d="M63 0L126 63L63 126L0 63L63 0Z"
          fill="#F0B90B"
        />
        <path
          d="M63 35.8L79.9 52.7L63 69.6L46.1 52.7L63 35.8Z"
          fill="#181A20"
        />
        <path
          d="M63 76.6L71.4 85L63 93.4L54.6 85L63 76.6Z"
          fill="#181A20"
        />
        <path
          d="M91.3 64.1L99.7 72.5L91.3 80.9L82.9 72.5L91.3 64.1Z"
          fill="#181A20"
        />
        <path
          d="M34.7 64.1L43.1 72.5L34.7 80.9L26.3 72.5L34.7 64.1Z"
          fill="#181A20"
        />
        <path
          d="M63 21.2L74.8 33L63 44.8L51.2 33L63 21.2Z"
          fill="#F0B90B"
        />
      </svg>

      {showText && (
        <span className={`font-bold tracking-tight text-white ${textMap[size]} flex items-center gap-1`}>
          <span>BINANCE</span>
          <span className="text-amber-400 font-normal text-xs uppercase px-1 py-0.5 rounded bg-amber-400/10 border border-amber-400/20 font-mono">
            Auth
          </span>
        </span>
      )}
    </div>
  );
};
