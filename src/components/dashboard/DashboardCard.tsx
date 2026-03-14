'use client';

import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  subtitle?: string;
  href: string;
  iconBg: string;
  iconColor: string;
}

export default function DashboardCard({
  icon: Icon,
  title,
  value,
  subtitle,
  href,
  iconBg,
  iconColor,
}: DashboardCardProps) {
  return (
    <Link href={href} className="block">
      <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow active:bg-gray-50">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
            <Icon size={22} className={iconColor} />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500">{title}</p>
            <p className="text-lg font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-400">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
