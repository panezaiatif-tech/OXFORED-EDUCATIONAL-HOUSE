import React from 'react';

interface SchoolLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showText?: boolean;
  variant?: 'light' | 'dark';
  className?: string;
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({
  size = 'md',
  showText = true,
  variant = 'dark',
  className = '',
}) => {
  // Dimensions
  const crestSizes = {
    sm: { w: 42, h: 42, fontSize: 'text-sm', subSize: 'text-[9px]' },
    md: { w: 56, h: 56, fontSize: 'text-lg sm:text-xl', subSize: 'text-[10px] sm:text-xs' },
    lg: { w: 76, h: 76, fontSize: 'text-xl sm:text-2xl', subSize: 'text-xs sm:text-sm' },
    hero: { w: 96, h: 96, fontSize: 'text-3xl sm:text-4xl', subSize: 'text-xs sm:text-sm' },
  }[size];

  return (
    <div className={`flex items-center gap-3.5 select-none ${className}`}>
      {/* Heraldic Shield Crest Emblem */}
      <div
        style={{ width: crestSizes.w, height: crestSizes.h }}
        className="relative shrink-0 flex items-center justify-center filter drop-shadow-md group transition-transform duration-300 hover:scale-105"
      >
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Deep Emerald Gradient */}
            <linearGradient id="shieldGrad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#064e3b" />
              <stop offset="45%" stopColor="#022c22" />
              <stop offset="100%" stopColor="#064e3b" />
            </linearGradient>

            {/* Radiant Golden Yellow Gradient */}
            <linearGradient id="goldGrad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="30%" stopColor="#eab308" />
              <stop offset="70%" stopColor="#ca8a04" />
              <stop offset="100%" stopColor="#facc15" />
            </linearGradient>

            {/* Inner Sheen */}
            <linearGradient id="sheenGrad" x1="20" y1="10" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.1" />
            </linearGradient>

            <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. Outer Crest Shield Frame */}
          <path
            d="M60 6 L108 22 C108 55 98 88 60 114 C22 88 12 55 12 22 Z"
            fill="url(#shieldGrad)"
            stroke="url(#goldGrad)"
            strokeWidth="3.5"
          />

          {/* 2. Inner Shield Concentric Border */}
          <path
            d="M60 14 L100 27 C100 53 92 81 60 104 C28 81 20 53 20 27 Z"
            fill="none"
            stroke="url(#goldGrad)"
            strokeWidth="1.2"
            strokeDasharray="2 1.5"
            opacity="0.85"
          />

          {/* 3. Subtle Inner Diagonal Sheen */}
          <path
            d="M60 6 L108 22 C108 55 98 88 60 114 Z"
            fill="url(#sheenGrad)"
          />

          {/* 4. Laurel Wreath Leaves (Left) */}
          <g fill="url(#goldGrad)" opacity="0.95">
            <path d="M26 42 Q28 36 34 38 Q31 43 26 42 Z" />
            <path d="M24 53 Q25 47 31 50 Q28 55 24 53 Z" />
            <path d="M25 65 Q28 60 34 63 Q31 68 25 65 Z" />
            <path d="M29 76 Q33 72 38 76 Q35 80 29 76 Z" />
            <path d="M37 87 Q41 83 46 87 Q42 91 37 87 Z" />
          </g>

          {/* Laurel Wreath Leaves (Right) */}
          <g fill="url(#goldGrad)" opacity="0.95">
            <path d="M94 42 Q92 36 86 38 Q89 43 94 42 Z" />
            <path d="M96 53 Q95 47 89 50 Q92 55 96 53 Z" />
            <path d="M95 65 Q92 60 86 63 Q89 68 95 65 Z" />
            <path d="M91 76 Q87 72 82 76 Q85 80 91 76 Z" />
            <path d="M83 87 Q79 83 74 87 Q78 91 83 87 Z" />
          </g>

          {/* 5. Three Excellence Stars at the Top */}
          <g fill="url(#goldGrad)">
            {/* Center Star */}
            <polygon points="60,19 62,24 67,24 63,27 65,32 60,29 55,32 57,27 53,24 58,24" />
            {/* Left Star */}
            <polygon points="46,24 47.5,27.5 51,27.5 48,29.5 49.5,33 46,31 42.5,33 44,29.5 41,27.5 44.5,27.5" transform="scale(0.85) translate(8,3)" />
            {/* Right Star */}
            <polygon points="74,24 75.5,27.5 79,27.5 76,29.5 77.5,33 74,31 70.5,33 72,29.5 69,27.5 72.5,27.5" transform="scale(0.85) translate(13,3)" />
          </g>

          {/* 6. Knowledge Open Book Symbol */}
          <g filter="url(#goldGlow)">
            {/* Left Page */}
            <path
              d="M60 67 C53 62 44 61 36 63 L36 78 C44 76 53 77 60 82 Z"
              fill="#ffffff"
              stroke="url(#goldGrad)"
              strokeWidth="1.2"
            />
            {/* Right Page */}
            <path
              d="M60 67 C67 62 76 61 84 63 L84 78 C76 76 67 77 60 82 Z"
              fill="#fef08a"
              stroke="url(#goldGrad)"
              strokeWidth="1.2"
            />
            {/* Book Spine */}
            <path d="M60 67 L60 82" stroke="url(#goldGrad)" strokeWidth="2" strokeLinecap="round" />
            {/* Lines on Left Page */}
            <path d="M41 68 C46 67 52 68 55 70" stroke="#064e3b" strokeWidth="1" strokeLinecap="round" />
            <path d="M41 72 C46 71 52 72 55 74" stroke="#064e3b" strokeWidth="1" strokeLinecap="round" />
            {/* Lines on Right Page */}
            <path d="M65 70 C68 68 74 67 79 68" stroke="#064e3b" strokeWidth="1" strokeLinecap="round" />
            <path d="M65 74 C68 72 74 71 79 72" stroke="#064e3b" strokeWidth="1" strokeLinecap="round" />
          </g>

          {/* 7. Graduation Cap (Mortarboard) Resting Above Book */}
          <g>
            {/* Cap Diamond */}
            <polygon
              points="60,37 79,45 60,53 41,45"
              fill="url(#goldGrad)"
              stroke="#ffffff"
              strokeWidth="1"
            />
            {/* Cap Skull Under-base */}
            <path
              d="M48 48.5 L48 55 C48 58 72 58 72 55 L72 48.5 Z"
              fill="#064e3b"
              stroke="url(#goldGrad)"
              strokeWidth="1.2"
            />
            {/* Tassel */}
            <circle cx="60" cy="45" r="1.8" fill="#ffffff" />
            <path
              d="M60 45 Q70 48 72 54 L72 61"
              stroke="url(#goldGrad)"
              strokeWidth="1.4"
              fill="none"
              strokeLinecap="round"
            />
            <polygon points="70,60 74,60 73,65 71,65" fill="url(#goldGrad)" />
          </g>

          {/* 8. Golden Banner at Bottom with "ESTD 2026" */}
          <g>
            <path
              d="M32 94 L88 94 L84 103 L60 101 L36 103 Z"
              fill="url(#goldGrad)"
              stroke="#064e3b"
              strokeWidth="0.8"
            />
            <text
              x="60"
              y="100.5"
              textAnchor="middle"
              fill="#022c22"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
              fontSize="6"
              fontWeight="900"
              letterSpacing="0.8"
            >
              ESTD 2026
            </text>
          </g>
        </svg>
      </div>

      {/* Typography Section */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={`font-serif font-black tracking-tight ${crestSizes.fontSize} ${
                variant === 'light' ? 'text-yellow-400' : 'text-emerald-950'
              }`}
            >
              OXFORED
            </span>
            <span
              className={`font-serif font-black tracking-tight ${crestSizes.fontSize} ${
                variant === 'light' ? 'text-yellow-300' : 'text-yellow-500'
              }`}
            >
              EDUCATIONAL
            </span>
            <span
              className={`font-serif font-black tracking-tight hidden sm:inline ${crestSizes.fontSize} ${
                variant === 'light' ? 'text-white' : 'text-emerald-900'
              }`}
            >
              HOUSE
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-1 sm:hidden">
            <span
              className={`font-serif font-black tracking-tight ${crestSizes.fontSize} ${
                variant === 'light' ? 'text-white' : 'text-emerald-900'
              }`}
            >
              HOUSE
            </span>
          </div>

          <p
            className={`font-mono font-bold tracking-widest uppercase mt-1 ${crestSizes.subSize} ${
              variant === 'light' ? 'text-emerald-200/90' : 'text-emerald-700'
            }`}
          >
            Digital School Management System • Quetta
          </p>
        </div>
      )}
    </div>
  );
};
