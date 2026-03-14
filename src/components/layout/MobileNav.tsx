'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlusCircle } from 'lucide-react';

export default function MobileNav() {
  const pathname = usePathname();

  const links = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/add', icon: PlusCircle, label: 'Add' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
      <div className="flex items-center justify-around h-16">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 text-xs transition-colors ${
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <link.icon size={22} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
