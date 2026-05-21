'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, BookOpen, User, Calendar, Menu } from 'lucide-react';
import { useState } from 'react';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPWA] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.matchMedia('(display-mode: standalone)').matches || !!window.navigator.standalone;
  });

  // Only show on mobile and when installed as PWA
  if (!isPWA) return null;

  const navItems = [
    {
      name: 'Home',
      icon: Home,
      path: '/',
      active: pathname === '/'
    },
    {
      name: 'Guides',
      icon: BookOpen,
      path: '/guides',
      active: pathname === '/guides'
    },
    {
      name: 'Book',
      icon: Calendar,
      path: '/book',
      active: pathname === '/book'
    },
    {
      name: 'Dashboard',
      icon: Menu,
      path: '/dashboard',
      active: pathname === '/dashboard'
    },
    {
      name: 'Profile',
      icon: User,
      path: '/profile',
      active: pathname === '/profile'
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${item.active
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-600 dark:text-gray-400'
                }`}
            >
              <Icon
                className={`w-6 h-6 mb-1 transition-transform ${item.active ? 'scale-110' : ''
                  }`}
              />
              <span className={`text-xs font-medium ${item.active ? 'font-semibold' : ''
                }`}>
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
