'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Register the service worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered successfully:', registration.scope);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            console.log('🔄 Service Worker update found');
            
            newWorker?.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker available
                console.log('✨ New content available, please refresh!');
                
                // Optional: Show a notification to the user
                if (window.confirm('New version available! Reload to update?')) {
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                  window.location.reload();
                }
              }
            });
          });
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error);
        });

      // Handle controller change (new service worker activated)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('🔄 Service Worker controller changed, reloading...');
        window.location.reload();
      });
    } else {
      console.log('⚠️ Service Workers not supported in this browser');
    }
  }, []);

  return null; // This component doesn't render anything
}
