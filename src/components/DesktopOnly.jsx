'use client';

import { useEffect, useState } from 'react';

/**
 * Conditionally hides desktop navigation when app is installed as PWA on mobile
 */
export default function DesktopOnly({ children }) {
  const [showDesktop, setShowDesktop] = useState(true);

  useEffect(() => {
    const checkDisplay = () => {
      const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                   window.navigator.standalone;
      const isMobile = window.innerWidth < 768;
      
      // Hide desktop navigation if PWA and mobile
      setShowDesktop(!(isPWA && isMobile));
    };

    checkDisplay();
    window.addEventListener('resize', checkDisplay);
    
    return () => window.removeEventListener('resize', checkDisplay);
  }, []);

  if (!showDesktop) return null;
  
  return <>{children}</>;
}
