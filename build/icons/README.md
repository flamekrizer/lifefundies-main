# PWA Icons Guide for LifeFundies

## Required Icons

You need to create the following icons in the `/public/icons/` directory:

### Standard Icons
- `icon-16x16.png` (16x16)
- `icon-32x32.png` (32x32)
- `icon-72x72.png` (72x72)
- `icon-96x96.png` (96x96)
- `icon-128x128.png` (128x128)
- `icon-144x144.png` (144x144)
- `icon-152x152.png` (152x152)
- `icon-192x192.png` (192x192)
- `icon-384x384.png` (384x384)
- `icon-512x512.png` (512x512)

### Also Create
- `/public/favicon.ico` (32x32)

## Design Guidelines

### Logo Design
Your LifeFundies logo should:
- Be simple and recognizable at small sizes
- Work on both light and dark backgrounds
- Have a clear focal point
- Use your brand colors (primarily green #10b981)
- Include a symbol that represents growth, guidance, or life (like a seedling 🌱)

### Maskable Icons
For `icon-192x192.png` and `icon-512x512.png`, make sure the important content is in the "safe zone":
- 80% of the icon should contain the important content
- The outer 10% on each side may be cropped on some devices
- Use a solid background color

## How to Generate Icons

### Option 1: Use Online Tool (Easiest)
1. Visit https://realfavicongenerator.net/
2. Upload your base logo (at least 512x512px PNG)
3. Customize for different platforms
4. Download and extract to `/public/icons/`

### Option 2: Use PWA Asset Generator
```bash
npm install -g pwa-asset-generator

# Generate all icons from a single source
pwa-asset-generator [source-logo] public/icons --icon-only --type png
```

### Option 3: Manual Design
1. Create a 512x512px base design in Figma/Sketch/Photoshop
2. Export at each required size
3. Optimize with tools like TinyPNG

## Splash Screens (Optional)

Create splash screens in `/public/splash/` for iOS:
- `splash-640x1136.png` (iPhone SE, 5s)
- `splash-750x1334.png` (iPhone 8, 7, 6)
- `splash-1242x2208.png` (iPhone 8 Plus)
- `splash-1125x2436.png` (iPhone X, XS)
- And more for other devices...

Or skip splash screens and the system will use your icons.

## Testing Your Icons

1. Build your app: `npm run build`
2. Test on Chrome DevTools > Application > Manifest
3. Install the PWA on your device
4. Check if icons appear correctly on:
   - Home screen
   - Task switcher
   - Settings

## Design Tips

For LifeFundies specifically:
- Use a seedling/plant motif (🌱) to represent growth
- Primary color: Emerald Green (#10b981)
- Keep it minimal and meditative
- Consider a circular or rounded square design
- Ensure good contrast for visibility

## Quick Start Template

If you need a placeholder quickly:
1. Create a 512x512px image with:
   - Emerald green background (#10b981)
   - White text "LF" in a clean sans-serif font
   - Centered, taking up ~60% of the space
2. Resize it to all required dimensions
3. Replace with actual designed icons later
