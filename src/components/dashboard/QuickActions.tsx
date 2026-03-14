'use client';

import Link from 'next/link';
import { BookOpen, Wallet, UtensilsCrossed } from 'lucide-react';

const actions = [
  { href: '/media/add', icon: BookOpen, label: 'Add Media', bg: 'bg-purple-100', color: 'text-purple-600' },
  { href: '/finance/add', icon: Wallet, label: 'Add Expense', bg: 'bg-green-100', color: 'text-green-600' },
  { href: '/food/add', icon: UtensilsCrossed, label: 'Log Food', bg: 'bg-orange-100', color: 'text-orange-600' },
];

export default function QuickActions() {
  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">Quick Actions</p>
      <div className="grid grid-cols-3 gap-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex flex-col items-center gap-2 py-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow active:bg-gray-50"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.bg}`}>
              <action.icon size={20} className={action.color} />
            </div>
            <span className="text-xs font-medium text-gray-600">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
