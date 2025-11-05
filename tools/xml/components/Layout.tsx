import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Lock, Unlock } from 'lucide-react';

interface LayoutProps {
  left: React.ReactNode;
  right: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ left, right }) => {
  const [isLocked, setIsLocked] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(30); // in percentage
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isLocked) return;
    e.preventDefault();

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((moveEvent.clientX - containerRect.left) / containerRect.width) * 100;
      if (newWidth > 15 && newWidth < 85) { // Min/max width constraints
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };


  return (
    <div ref={containerRef} className="flex h-full w-full gap-2">
      {left && (
         <div style={{ width: right ? `${sidebarWidth}%` : '100%' }} className="h-full">
            {left}
        </div>
      )}
      {left && right && (
        <div 
          onMouseDown={handleMouseDown} 
          className={`w-2 h-full rounded-full flex items-center justify-center relative group ${isLocked ? 'cursor-default' : 'cursor-col-resize'} bg-slate-700`}
        >
          <div className={`w-full h-full ${!isLocked && 'group-hover:bg-cyan-600'} rounded-full`}>
            <div className="w-1 h-8 bg-slate-600 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsLocked(l => !l);
            }}
            className="absolute z-10 w-6 h-6 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            aria-label={isLocked ? 'Unlock panel resizing' : 'Lock panel resizing'}
          >
            {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
          </button>
        </div>
      )}
      {right && (
        <div style={{ width: left ? `${100 - sidebarWidth}%` : '100%' }} className="h-full">
            {right}
        </div>
      )}
    </div>
  );
};

export default Layout;