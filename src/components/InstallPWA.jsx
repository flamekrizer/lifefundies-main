'use client';

import { useState, useEffect } from 'react';

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return; // Already installed
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      
      // Save the event so it can be triggered later
      setDeferredPrompt(e);
      
      // Show install button after a delay (not immediately on page load)
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 5000); // Show after 5 seconds
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Save dismissal in localStorage to not show again for a while
    localStorage.setItem('installPromptDismissed', Date.now().toString());
  };

  // Check if user dismissed recently
  useEffect(() => {
    const dismissed = localStorage.getItem('installPromptDismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      
      // Don't show again if dismissed less than 7 days ago
      if (daysSinceDismissed < 7) {
        setShowInstallPrompt(false);
      }
    }
  }, []);

  if (!showInstallPrompt || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-slide-up">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🌱</span>
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Install LifeFundies App
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              Get quick access and work offline. Install the app for the best experience.
            </p>
            
            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleInstallClick}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Not Now
              </button>
            </div>
          </div>
          
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
