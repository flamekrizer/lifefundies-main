# 🚀 Starting Your LifeFundies PWA

## Development Mode

```bash
npm run dev
```

**Note:** Service worker is disabled in development mode for easier debugging.

## Production Build & Test

### 1. Build the app
```bash
npm run build
```

### 2. Serve locally
Since you're using static export, use `serve` instead of `next start`:

```bash
npx serve@latest out -l 3000
```

Or install serve globally:
```bash
npm install -g serve
serve out -l 3000
```

### 3. Test the PWA
Open http://localhost:3000 in your browser and:

1. ✅ Open DevTools → Application → Service Workers
2. ✅ Check if service worker is registered
3. ✅ Go to Manifest tab and verify manifest.json
4. ✅ Test offline mode (DevTools → Network → Offline)
5. ✅ Run Lighthouse audit for PWA score

## Deploy to Production

### ✅ Firebase Hosting (RECOMMENDED & WORKING)

Your app is **already live** at: **https://lifefundies-d66e9.web.app**

To update your deployment:

```bash
# 1. Login to Firebase (if not logged in)
firebase login

# 2. Build the app
npm run build

# 3. Deploy
firebase deploy
```

**Why Firebase?**
- ✅ Works perfectly with static export
- ✅ PWA features work out of the box
- ✅ Free SSL certificate
- ✅ CDN included
- ✅ Custom domain support

### Vercel (Alternative - Needs Configuration)

If you want to use Vercel, you may need to configure it differently:

```bash
# Option 1: Deploy the out folder directly
cd out
vercel --prod

# Option 2: Use Vercel dashboard
# 1. Go to vercel.com
# 2. Import your GitHub repo
# 3. Set Build Command: npm run build
# 4. Set Output Directory: out
# 5. Click Deploy
```

**Note:** Due to Turbopack and Tailwind CSS arbitrary value handling with static export, Vercel might require additional configuration. Firebase is the recommended deployment method for this setup.

### Other Static Hosts
Upload the `out/` directory to:
- Netlify
- GitHub Pages
- Cloudflare Pages
- Any static hosting

## Testing PWA Installation

### On Desktop (Chrome/Edge)
1. Visit your deployed URL
2. Look for install icon in address bar
3. Click to install

### On Android (Chrome)
1. Visit your deployed URL
2. Tap menu (⋮) → "Install app" or "Add to Home screen"

### On iOS (Safari)
1. Visit your deployed URL  
2. Tap Share button (⎙)
3. Select "Add to Home Screen"

## Important Notes

⚠️ **HTTPS Required**: PWA features only work on HTTPS (or localhost for testing)

⚠️ **Icons Needed**: Create icons in `/public/icons/` directory before deploying (see `/public/icons/README.md`)

⚠️ **Service Worker Cache**: After updates, users may need to close and reopen the app to see changes

## Troubleshooting

### Service Worker not registering?
- Make sure you're on HTTPS
- Check browser console for errors
- Clear cache and hard reload (Cmd+Shift+R)

### 404 errors when running locally?
- Build first: `npm run build`
- Make sure you're in the project directory
- Use `serve` not `npm start`

### Changes not showing?
- Clear service worker cache in DevTools
- Unregister service worker
- Hard reload

## What's Configured

✅ Custom service worker (`/public/sw.js`)  
✅ Automatic registration (`/src/components/ServiceWorkerRegistration.jsx`)  
✅ Offline fallback page  
✅ App manifest with shortcuts  
✅ Meta tags for all platforms  
✅ Static export ready for any host  

Your PWA is production-ready! 🎉
