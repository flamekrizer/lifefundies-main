'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to detect if app is running as installed PWA
 */
export function useIsPWA() {
  const [isPWA, setIsPWA] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if running in standalone mode (installed PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        window.navigator.standalone || 
                        document.referrer.includes('android-app://');
    
    setIsPWA(isStandalone);
    setIsLoading(false);
  }, []);

  return { isPWA, isLoading };
}

/**
 * Hook to check if PWA is installable
 */
export function useIsPWAInstallable() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    setDeferredPrompt(null);
    setIsInstallable(false);
    
    return outcome === 'accepted';
  };

  return { isInstallable, install };
}

/**
 * Hook to detect online/offline status
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * PWA Status indicator component (optional - shows when offline or updates available)
 */
export function PWAStatus() {
  const isOnline = useOnlineStatus();
  const [showOffline, setShowOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowOffline(true);
    } else {
      // Delay hiding to avoid flashing
      const timer = setTimeout(() => setShowOffline(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (!showOffline && isOnline) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
      !isOnline ? 'translate-y-0' : 'translate-y-0'
    }`}>
      <div className={`${
        isOnline ? 'bg-green-500' : 'bg-amber-500'
      } text-white text-center py-2 px-4 text-sm font-medium`}>
        {isOnline ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back online
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
            </svg>
            You're offline - Some features may be limited
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Utility functions
 */
export const pwaUtils = {
  // Check if app is installed
  isInstalled: () => {
    return window.matchMedia('(display-mode: standalone)').matches || 
           window.navigator.standalone || 
           document.referrer.includes('android-app://');
  },

  // Check if on iOS
  isIOS: () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  },

  // Check if on Android
  isAndroid: () => {
    return /Android/.test(navigator.userAgent);
  },

  // Get display mode
  getDisplayMode: () => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return 'standalone';
    }
    if (window.matchMedia('(display-mode: fullscreen)').matches) {
      return 'fullscreen';
    }
    if (window.matchMedia('(display-mode: minimal-ui)').matches) {
      return 'minimal-ui';
    }
    return 'browser';
  },

  // Request persistent storage (for important data)
  requestPersistentStorage: async () => {
    if (navigator.storage && navigator.storage.persist) {
      const isPersisted = await navigator.storage.persist();
      console.log(`Persistent storage: ${isPersisted ? 'granted' : 'denied'}`);
      return isPersisted;
    }
    return false;
  }
};
