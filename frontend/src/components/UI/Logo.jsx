import React from 'react';

const Logo = ({ className = "", size = "normal", showText = true, textColor = "text-gray-900" }) => {
  const logoSizes = {
    small: "h-6",
    normal: "h-8", 
    large: "h-10"
  };

  const textSizes = {
    small: "text-lg",
    normal: "text-xl",
    large: "text-2xl"
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Monexo Logo SVG */}
      <svg 
        className={`${logoSizes[size]} w-auto`}
        viewBox="0 0 120 120" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background circle */}
        <circle cx="90" cy="90" r="25" fill="#1e3a8a" stroke="#1e3a8a" strokeWidth="2"/>
        
        {/* Dollar sign */}
        <path d="M85 80 L85 100 M95 80 L95 100 M82 85 Q82 82 85 82 L93 82 Q95 82 95 84 Q95 86 93 86 L87 86 Q85 86 85 88 Q85 90 87 90 L93 90 Q95 90 95 92 Q95 95 93 95 L85 95 Q82 95 82 92" 
              stroke="white" 
              strokeWidth="2" 
              fill="none"
              strokeLinecap="round"/>
        
        {/* Document/Chart background */}
        <rect x="20" y="30" width="70" height="50" rx="4" fill="white" stroke="#1e3a8a" strokeWidth="3"/>
        
        {/* Corner fold */}
        <path d="M75 30 L75 45 L90 45" fill="none" stroke="#1e3a8a" strokeWidth="2"/>
        <path d="M75 30 L75 45 L90 45 Z" fill="#e5e7eb"/>
        
        {/* Chart bars */}
        <rect x="30" y="55" width="6" height="15" fill="#1e3a8a"/>
        <rect x="40" y="50" width="6" height="20" fill="#1e3a8a"/>
        <rect x="50" y="45" width="6" height="25" fill="#1e3a8a"/>
        <rect x="60" y="52" width="6" height="18" fill="#1e3a8a"/>
      </svg>
      
      {/* Text logo */}
      {showText && (
        <span 
          className={`font-bold ${textColor} ${textSizes[size]}`}
        >
          MONEXO
        </span>
      )}
    </div>
  );
};

export default Logo;
