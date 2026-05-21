'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;

    let refreshing = false;

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        console.log('[PWA] Service Worker registered:', registration.scope);

        // Force check for updates on every load
        registration.update();

        // If a new SW is found
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              console.log('[PWA] New version installed, activating...');
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        });
      } catch (error) {
        console.error('[PWA] Service Worker registration failed:', error);
      }
    };

    registerSW();

    const onControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      console.log('[PWA] Controller changed, reloading...');
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener(
      'controllerchange',
      onControllerChange
    );

    return () => {
      navigator.serviceWorker.removeEventListener(
        'controllerchange',
        onControllerChange
      );
    };
  }, []);

  return null;
}