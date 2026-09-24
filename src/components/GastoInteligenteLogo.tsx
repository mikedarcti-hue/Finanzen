import React, { useState } from 'react';

interface GastoInteligenteLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export const GastoInteligenteLogo: React.FC<GastoInteligenteLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-base sm:text-lg',
    lg: 'text-xl sm:text-2xl',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* App Icon Container */}
      <div
        className={`relative ${iconSizes[size]} rounded-2xl overflow-hidden bg-black flex items-center justify-center shrink-0 shadow-lg shadow-emerald-950/40 border border-emerald-500/30 group`}
      >
        {!imageError ? (
          <img
            src="/logo.png"
            alt="Gasto Inteligente"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          /* High-fidelity Vector Fallback */
          <div className="w-full h-full bg-gradient-to-br from-slate-950 via-[#0B1510] to-black flex items-center justify-center p-1.5">
            <svg
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              {/* Glowing outer circular ring */}
              <circle
                cx="50"
                cy="50"
                r="44"
                stroke="#10B981"
                strokeWidth="4"
                strokeLinecap="round"
                className="opacity-90"
              />
              {/* Dollar bills peek */}
              <rect
                x="32"
                y="18"
                width="36"
                height="22"
                rx="3"
                transform="rotate(-10 32 18)"
                fill="#059669"
                stroke="#10B981"
                strokeWidth="2"
              />
              <text
                x="45"
                y="29"
                fill="#E6FFFA"
                fontSize="10"
                fontWeight="bold"
                textAnchor="middle"
              >
                $
              </text>

              {/* Wallet Base */}
              <rect
                x="24"
                y="34"
                width="54"
                height="38"
                rx="8"
                fill="#1E293B"
                stroke="#334155"
                strokeWidth="2"
              />
              {/* Wallet Flap clasp */}
              <rect
                x="64"
                y="46"
                width="16"
                height="14"
                rx="4"
                fill="#0F172A"
                stroke="#10B981"
                strokeWidth="1.5"
              />
              <circle cx="72" cy="53" r="2.5" fill="#34D399" />

              {/* Rising Bar Chart on Wallet */}
              <rect x="30" y="56" width="6" height="10" rx="1.5" fill="#10B981" />
              <rect x="39" y="50" width="6" height="16" rx="1.5" fill="#10B981" />
              <rect x="48" y="42" width="6" height="24" rx="1.5" fill="#34D399" />

              {/* Upward Growth Arrow */}
              <path
                d="M28 64 C 36 60, 44 48, 58 38"
                stroke="#34D399"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <polygon points="56,35 64,36 60,44" fill="#34D399" />
            </svg>
          </div>
        )}
      </div>

      {/* Typography */}
      <div className="flex flex-col leading-none">
        <div className={`font-black tracking-tight ${titleSizes[size]}`}>
          <span className="text-white drop-shadow-sm">Gasto</span>
          <span className="text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]">
            Inteligente
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[9px] font-bold tracking-[0.14em] text-slate-400 uppercase mt-1">
            Gestão e Inteligência de Gastos
          </span>
        )}
      </div>
    </div>
  );
};
