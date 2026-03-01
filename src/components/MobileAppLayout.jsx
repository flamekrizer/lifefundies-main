'use client';

import { useEffect, useState } from 'react';
import MobileTopBar from './MobileTopBar';
import MobileBottomNav from './MobileBottomNav';

export default function MobileAppLayout({ children }) {
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    // Check if running as installed PWA
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                       window.navigator.standalone;
    setIsPWA(isInstalled);
  }, []);

  return (
    <>
      <MobileTopBar />
      
      {/* Main content with proper spacing for top and bottom bars */}
      <main className={isPWA ? 'md:pt-0 pt-14 md:pb-0 pb-16' : ''}>
        {children}
      </main>
      
      <MobileBottomNav />
    </>
  );
}
