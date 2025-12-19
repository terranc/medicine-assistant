import React from 'react';

interface OnboardingOverlayProps {
  onClose: () => void;
}

export const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({ onClose }) => {
  return (
    <div 
      className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-[1px] cursor-pointer animate-in fade-in duration-300"
      onClick={onClose}
    >
      {/* Container positioned relative to top-right to match the settings button location */}
      <div className="absolute top-16 right-8 md:right-16 flex flex-col items-end animate-in slide-in-from-bottom-4 slide-in-from-right-2 duration-500">
        
        {/* Hand-drawn Arrow SVG */}
        <div className="relative mr-4 -mt-2">
            <svg 
                width="100" 
                height="100" 
                viewBox="0 0 100 100" 
                fill="none" 
                className="text-white drop-shadow-md transform -rotate-12"
                style={{ filter: "drop-shadow(2px 2px 2px rgba(0,0,0,0.5))" }}
            >
                {/* Shaft */}
                <path 
                    d="M 20 90 Q 50 50 85 15" 
                    stroke="currentColor" 
                    strokeWidth="3" 
                    strokeLinecap="round"
                    style={{ strokeDasharray: "100", animation: "dash 1s linear forwards" }}
                />
                {/* Arrowhead */}
                <path 
                    d="M 65 20 L 85 15 L 75 40" 
                    stroke="currentColor" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                />
            </svg>
        </div>

        {/* Text */}
        <div className="mt-2 mr-2 bg-white text-primary px-4 py-3 rounded-xl shadow-xl transform -rotate-3 border-2 border-primary/20 max-w-[200px] text-center">
            <p className="font-bold text-lg leading-tight">请先设置<br/>Gemini API Key</p>
            <p className="text-xs text-muted-foreground mt-1">点击右上角图标开启 AI 之旅</p>
        </div>
      </div>
    </div>
  );
};