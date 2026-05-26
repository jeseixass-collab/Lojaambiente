import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function LojaAmbienteLogo({ className = '', size = 'md' }: LogoProps) {
  const pixelSizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24'
  };

  return (
    <div className={`flex items-center justify-center ${pixelSizes[size]} ${className}`} id="loja-ambiente-custom-logo">
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm select-none"
      >
        {/* Decorative background base if needed */}
        <defs>
          <linearGradient id="logo-plum-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8F1E62" />
            <stop offset="50%" stopColor="#7A1657" />
            <stop offset="100%" stopColor="#550B3B" />
          </linearGradient>
          <linearGradient id="logo-pink-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#DFCAD5" />
            <stop offset="100%" stopColor="#7A1657" />
          </linearGradient>
        </defs>

        {/* Clean geometric stylized premium "A" from Loja Ambiente branding */}
        {/* Left thick curved pillar */}
        <path
          d="M32 85 C28 65, 38 35, 50 15 C52 11, 56 11, 58 15 C70 35, 80 65, 76 85 C75 87, 72 88, 70 86 C64 80, 50 78, 38 86 C36 88, 33 87, 32 85Z"
          fill="url(#logo-plum-grad)"
        />
        
        {/* Right overlapping elegant ribbon forming the crossbar and visual contrast */}
        <path
          d="M42 55 C50 51, 62 51, 70 57 C72 58, 73 55, 71 53 C64 47, 50 45, 40 51 C38 52, 39 56, 42 55Z"
          fill="#FAF6F8"
          opacity="0.9"
        />

        {/* Stylized custom inner accent */}
        <path
          d="M50 20 L40 75 C45 78, 55 78, 60 75 Z"
          fill="url(#logo-pink-grad)"
          opacity="0.3"
        />

        {/* Outer orbital decorative ring */}
        <circle cx="50" cy="50" r="46" stroke="#7A1657" strokeWidth="1.5" strokeDasharray="4 6" opacity="0.4" />
      </svg>
    </div>
  );
}
