# LifeFundies PWA Setup Guide 🌱

This document explains the Progressive Web App (PWA) implementation for LifeFundies.

## ✅ What's Been Implemented

### 1. **PWA Configuration** 
- ✅ next-pwa configured in `next.config.mjs`
- ✅ Service Worker auto-generated
- ✅ Offline support enabled
- ✅ Cache strategies configured

### 2. **App Manifest** 
- ✅ Created `public/manifest.json`
- ✅ App name, description, and theme configured
- ✅ Icon sizes defined (72px to 512px)
- ✅ App shortcuts added (Book, Guides, Dashboard)
- ✅ Display mode: standalone (feels like native app)

### 3. **Meta Tags** 
- ✅ PWA meta tags in `layout.js`
- ✅ Apple touch icons configured
- ✅ Theme color set to emerald green (#10b981)
- ✅ Mobile web app capable tags
- ✅ Status bar styling for iOS

### 4. **Offline Experience**
- ✅ Offline page created (`/app/offline/page.jsx`)
- ✅ Fallback HTML (`/public/offline.html`)
- ✅ Service worker caching strategy

### 5. **Install Prompt Component**
- ✅ `InstallPWA.jsx` component created
- ✅ Smart timing (shows after 5 seconds)
- ✅ Dismissal tracking (7-day cooldown)
- ✅ Beautiful UI with animations

## 🚀 How to Use

### Build & Test the PWA

```bash
# Development (PWA disabled in dev)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm start
```

### Test PWA Features

1. **Chrome DevTools**
   - Open DevTools → Application tab
   - Check "Manifest" section
   - Check "Service Workers"
   - Use Lighthouse for PWA audit

2. **Install the App**
   - Build and deploy your app
   - Visit the URL on mobile or desktop
   - Look for "Install" prompt in browser
   - Or use browser menu → "Install LifeFundies"

3. **Test Offline Mode**
   - Install the app
   - Open DevTools → Network tab
   - Set to "Offline"
   - Navigate the app
   - Should see offline page for uncached routes

## 📱 Adding Install Prompt to Your App

Add the `<InstallPWA />` component to your layout or any page:

```jsx
import InstallPWA from '@/components/InstallPWA';

export default function YourComponent() {
  return (
    <div>
      {/* Your content */}
      
      <InstallPWA />
    </div>
  );
}
```

**Recommended placement:**
- Main layout (shows on all pages)
- Homepage hero section
- Dashboard
- After user signs up

## 🎨 Creating Your Icons

**YOU NEED TO CREATE ICONS!** The manifest references icons that don't exist yet.

### Required Icons (in `/public/icons/`)
- icon-16x16.png
- icon-32x32.png
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

### Quick Solution

**Option 1: Use realfavicongenerator.net**
1. Create a 512x512px logo
2. Visit https://realfavicongenerator.net/
3. Upload your logo
4. Download and extract to `/public/icons/`

**Option 2: Use pwa-asset-generator**
```bash
npx pwa-asset-generator source-logo.png public/icons --icon-only
```

**Option 3: Temporary Placeholder**

Create a simple 512x512px image with:
- Emerald green background (#10b981)
- White "LF" text
- Resize to all needed sizes

See `/public/icons/README.md` for detailed instructions.

## 🔧 PWA Features Configured

### Caching Strategy
- **Precache:** App shell, main pages
- **Runtime Cache:** Images, API calls
- **Offline Fallback:** `/offline` page

### App Capabilities
- ✅ Installable (Add to Home Screen)
- ✅ Offline support
- ✅ Push notifications ready (can be enabled)
- ✅ Background sync ready (can be enabled)
- ✅ Fast loading (service worker cache)
- ✅ App-like experience (no browser UI)

### Device Support
- ✅ Android (Chrome, Edge, Samsung Internet)
- ✅ iOS 16.4+ (Safari)
- ✅ Desktop (Chrome, Edge, Opera)
- ✅ Windows (installable)
- ✅ macOS (installable)

## 📊 Testing Checklist

Before launch, verify:

- [ ] Icons display correctly in manifest
- [ ] App installs on Android device
- [ ] App installs on iOS device
- [ ] App installs on desktop
- [ ] Offline page shows when offline
- [ ] Service worker registers correctly
- [ ] Theme color appears in status bar
- [ ] App shortcuts work
- [ ] Lighthouse PWA score > 90
- [ ] Install prompt appears
- [ ] App name correct on home screen

## 🚨 Important Notes

### Static Export (`output: 'export'`)
Your Next.js config uses static export. This means:
- ✅ PWA works great with static sites
- ✅ Can deploy to any static host (Vercel, Netlify, etc.)
- ❌ No API routes (use external API or Firebase)
- ❌ No server-side rendering at runtime

This is perfect for your Firebase setup!

### iOS Considerations
- iOS requires HTTPS (even for testing, use ngrok/Vercel preview)
- Install prompt is manual on iOS (Share → Add to Home Screen)
- Some PWA features limited on iOS vs Android
- Works best on iOS 16.4+

### Service Worker Updates
When you update your app:
1. Users will get the new version automatically
2. Service worker updates in background
3. May need to close and reopen app for new SW

## 🔮 Future Enhancements

You can add later:

### Push Notifications
```javascript
// Request permission
Notification.requestPermission();

// Subscribe to push
registration.pushManager.subscribe({...});
```

### Background Sync (for offline actions)
```javascript
// Register sync
registration.sync.register('sync-bookings');
```

### Periodic Background Sync
```javascript
// Check for updates periodically
registration.periodicSync.register('content-sync', {
  minInterval: 24 * 60 * 60 * 1000 // 1 day
});
```

### Share Target API
```javascript
// Allow users to share to your app
// Add to manifest.json
"share_target": {
  "action": "/share",
  "method": "POST",
  "params": {
    "title": "title",
    "text": "text"
  }
}
```

## 🐛 Troubleshooting

### Service Worker Not Registering
- Check browser console for errors
- Ensure HTTPS (required for PWA)
- Clear cache and hard reload
- Check if service worker is blocked

### Icons Not Showing
- Verify icon files exist in `/public/icons/`
- Check file names match manifest.json exactly
- Clear browser cache
- Reinstall the app

### Install Prompt Not Showing
- Must be on HTTPS
- Must meet PWA installability criteria
- Some browsers hide prompt if dismissed before
- iOS doesn't show automatic prompt (manual only)

### Offline Page Not Working
- Check service worker is active
- Verify offline.html exists in /public/
- Check cache strategy in next-pwa config

## 📚 Resources

- [Next PWA Documentation](https://github.com/shadowwalker/next-pwa)
- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)
- [MDN PWA Documentation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [PWA Builder](https://www.pwabuilder.com/)

## 🎯 Next Steps

1. **Create icons** (most important!)
2. **Add `<InstallPWA />` to your layout**
3. **Test on real devices**
4. **Deploy to production (with HTTPS)**
5. **Run Lighthouse audit**
6. **Monitor PWA metrics**

---

**Need help?** Check the console for PWA-related logs or use Chrome DevTools → Application → Manifest to debug.

Happy building! 🌱
