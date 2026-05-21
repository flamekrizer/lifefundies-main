'use client';

import { useEffect } from 'react';

/**
 * 💳 Cashfree SDK Loader
 * Loads Cashfree checkout script on client side
 */
export default function CashfreeScript() {
  useEffect(() => {
    // Check if script already exists
    if (document.querySelector('script[src*="cashfree"]')) {
      return;
    }

    // Create and append script
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup on unmount
      const existingScript = document.querySelector('script[src*="cashfree"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return null;
}
