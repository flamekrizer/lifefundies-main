# How to Add PWA Components to Your App

## 1. Add Install Prompt to Layout

Edit `/src/app/layout.js` to include the install prompt:

```jsx
import "./globals.css";
import { AuthProvider } from "@/app/context/AuthContext";
import ThemeProvider from "@/components/ThemeProvider";
import InstallPWA from "@/components/InstallPWA";
import { PWAStatus } from "@/lib/pwaUtils";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* ... existing head tags ... */}
      </head>
      <body>
        <AuthProvider>
          <ThemeProvider>
            <PWAStatus />
            {children}
            <InstallPWA />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

## 2. Use PWA Hooks in Components

```jsx
'use client';

import { useIsPWA, useOnlineStatus, useIsPWAInstallable } from '@/lib/pwaUtils';

export default function MyComponent() {
  const { isPWA } = useIsPWA();
  const isOnline = useOnlineStatus();
  const { isInstallable, install } = useIsPWAInstallable();

  return (
    <div>
      {isPWA && <p>Running as installed app! 🎉</p>}
      {!isOnline && <p>You're offline</p>}
      {isInstallable && (
        <button onClick={install}>Install App</button>
      )}
    </div>
  );
}
```

## 3. Show Different UI for Installed App

```jsx
'use client';

import { useIsPWA } from '@/lib/pwaUtils';

export default function Header() {
  const { isPWA } = useIsPWA();

  return (
    <header>
      {!isPWA && (
        <div>Browse on web - Install for better experience</div>
      )}
      {/* ... rest of header ... */}
    </header>
  );
}
```

## 4. Handle Offline Actions

```jsx
'use client';

import { useOnlineStatus } from '@/lib/pwaUtils';
import { useState } from 'react';

export default function BookingForm() {
  const isOnline = useOnlineStatus();
  const [offlineQueue, setOfflineQueue] = useState([]);

  const handleSubmit = (data) => {
    if (isOnline) {
      // Submit immediately
      submitBooking(data);
    } else {
      // Queue for later
      setOfflineQueue([...offlineQueue, data]);
      localStorage.setItem('offlineBookings', JSON.stringify([...offlineQueue, data]));
      alert('Saved! Will submit when you\'re online.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {!isOnline && (
        <div className="bg-amber-100 p-3 rounded-lg mb-4">
          ⚠️ You're offline. Booking will be saved and submitted when online.
        </div>
      )}
      {/* ... form fields ... */}
    </form>
  );
}
```

## 5. Custom Install Button

```jsx
'use client';

import { useIsPWAInstallable, useIsPWA } from '@/lib/pwaUtils';

export default function CustomInstallButton() {
  const { isInstallable, install } = useIsPWAInstallable();
  const { isPWA } = useIsPWA();

  if (isPWA) return null; // Already installed
  if (!isInstallable) return null; // Not installable

  return (
    <button
      onClick={install}
      className="bg-green-600 text-white px-6 py-3 rounded-lg"
    >
      📱 Install LifeFundies App
    </button>
  );
}
```

## 6. Platform-Specific Instructions

```jsx
'use client';

import { pwaUtils } from '@/lib/pwaUtils';
import { useEffect, useState } from 'react';

export default function InstallInstructions() {
  const [platform, setPlatform] = useState('');

  useEffect(() => {
    if (pwaUtils.isIOS()) setPlatform('ios');
    else if (pwaUtils.isAndroid()) setPlatform('android');
    else setPlatform('desktop');
  }, []);

  if (pwaUtils.isInstalled()) return null;

  return (
    <div className="bg-blue-50 p-4 rounded-lg">
      <h3>Install LifeFundies App</h3>
      {platform === 'ios' && (
        <p>
          Tap the Share button <span className="text-2xl">⎙</span> and 
          select "Add to Home Screen"
        </p>
      )}
      {platform === 'android' && (
        <p>
          Tap the menu button <span className="text-2xl">⋮</span> and 
          select "Install app" or "Add to Home screen"
        </p>
      )}
      {platform === 'desktop' && (
        <p>
          Click the install icon in the address bar or browser menu
        </p>
      )}
    </div>
  );
}
```

## 7. Check PWA Status in Dashboard

```jsx
'use client';

import { pwaUtils, useIsPWA } from '@/lib/pwaUtils';

export default function PWADashboard() {
  const { isPWA } = useIsPWA();

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">App Status</h2>
      
      <div className="space-y-2">
        <div>
          <strong>Display Mode:</strong> {pwaUtils.getDisplayMode()}
        </div>
        <div>
          <strong>Installed:</strong> {isPWA ? '✅ Yes' : '❌ No'}
        </div>
        <div>
          <strong>Platform:</strong> {
            pwaUtils.isIOS() ? 'iOS' : 
            pwaUtils.isAndroid() ? 'Android' : 
            'Desktop'
          }
        </div>
      </div>
    </div>
  );
}
```

## Quick Start

**Simplest integration** - Add to your layout:

```jsx
import InstallPWA from "@/components/InstallPWA";

export default function Layout({ children }) {
  return (
    <html>
      <body>
        {children}
        <InstallPWA />
      </body>
    </html>
  );
}
```

That's it! The install prompt will automatically show when appropriate.
