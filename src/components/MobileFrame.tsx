import React from 'react';

interface MobileFrameProps {
  children: React.ReactNode;
  isShaking: boolean;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children, isShaking }) => {
  return (
    <div className="flex items-center justify-center h-[100dvh] w-full bg-[#f8f4eb] sm:bg-slate-950 p-0 sm:p-4 overflow-hidden selection:bg-amber-300 selection:text-slate-900 fixed inset-0">
      {/* Mobile Container: Full screen on mobile, styled phone mockup on desktop */}
      <main
        className={`relative w-full h-[100dvh] sm:max-w-[430px] sm:h-[844px] sm:max-h-[844px] bg-[#f8f4eb] sm:rounded-[44px] sm:shadow-2xl overflow-hidden flex flex-col justify-between border-0 sm:border-8 sm:border-slate-800 ${
          isShaking ? 'screen-shaking' : ''
        }`}
      >
        {/* Subtle background terrain texture */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px]" />
        
        {children}
      </main>
    </div>
  );
};
