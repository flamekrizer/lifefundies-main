'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft, Bell, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function MobileTopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    // Check if running as installed PWA
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                       window.navigator.standalone;
    setIsPWA(isInstalled);
  }, []);

  // Only show on mobile and when installed as PWA
  if (!isPWA) return null;

  // Get page title based on pathname
  const getPageTitle = () => {
    const routes = {
      '/': 'LifeFundies',
      '/guide': 'Find Guides',
      '/book': 'Book Session',
      '/dashboard': 'My Dashboard',
      '/profile': 'My Profile',
      '/about': 'About Us',
      '/contact': 'Contact',
      '/faq': 'FAQ',
      '/login': 'Login',
      '/signup': 'Sign Up',
      '/team': 'Our Team',
      '/upgrade': 'Upgrade',
      '/offline': 'Offline'
    };
    
    // Check for dynamic routes
    if (pathname.startsWith('/team/')) {
      return 'Guide Profile';
    }
    
    return routes[pathname] || 'LifeFundies';
  };

  const showBackButton = pathname !== '/';

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 safe-area-top">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left Section */}
        <div className="flex items-center space-x-3">
          {showBackButton ? (
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          ) : (
            <div className="w-8 h-8 relative">
              <Image 
                src="/logo.jpeg" 
                alt="LifeFundies" 
                width={32}
                height={32}
                className="rounded-lg"
              />
            </div>
          )}
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            {getPageTitle()}
          </h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative">
            <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            {/* Notification badge */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
          </button>
          <button 
            onClick={() => router.push('/profile')}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      </div>
    </header>
  );
}
