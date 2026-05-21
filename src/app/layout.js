
import "./globals.css";
import { AuthProvider } from "@/app/context/AuthContext";
import ThemeProvider from "@/components/ThemeProvider";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import MobileAppLayout from "@/components/MobileAppLayout";
import CashfreeScript from "@/components/CashfreeScript";

export const metadata = {
  title: "LifeFundies - Life Guidance & Clarity",
  description: "Privacy-first holistic life-guidance app connecting you with relatable guides for clarity, confidence, and direction",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'LifeFundies'
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#10b981'
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#10b981" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="LifeFundies" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />

        {/* PWA Icons */}
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* iOS Splash Screens - Optional */}
        <link
          rel="apple-touch-startup-image"
          href="/splash/splash-640x1136.png"
          media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/splash-750x1334.png"
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)"
        />
      </head>
      <body>
        <ServiceWorkerRegistration />
        <CashfreeScript />
        <AuthProvider>
          <ThemeProvider>
            <MobileAppLayout>
              {children}
            </MobileAppLayout>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
