'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Wallet, UtensilsCrossed } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import DashboardCard from '@/components/dashboard/DashboardCard';
import QuickActions from '@/components/dashboard/QuickActions';

export default function DashboardPage() {
  const [mediaCount, setMediaCount] = useState(0);
  const [todaySpent, setTodaySpent] = useState(0);
  const [todayCalories, setTodayCalories] = useState(0);
  const [calorieTarget, setCalorieTarget] = useState(2000);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];

    // Fetch in-progress media count
    fetch('/api/media?status=in_progress')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setMediaCount(data.length);
      })
      .catch(() => {});

    // Fetch today's spending
    fetch('/api/expenses/summary?period=today')
      .then((r) => r.json())
      .then((data) => {
        if (data.total !== undefined) setTodaySpent(data.total);
      })
      .catch(() => {});

    // Fetch today's calories
    fetch(`/api/food/summary?date=${today}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.total_calories !== undefined) setTodayCalories(data.total_calories);
        if (data.target) setCalorieTarget(data.target);
      })
      .catch(() => {});
  }, []);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">{greeting}</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {now.toLocaleDateString('en-MY', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="space-y-3 mb-6">
        <DashboardCard
          icon={BookOpen}
          title="Reading & Watching"
          value={`${mediaCount} in progress`}
          subtitle="Books & videos"
          href="/media"
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />

        <DashboardCard
          icon={Wallet}
          title="Today's Spending"
          value={formatCurrency(todaySpent)}
          subtitle="Tap to see details"
          href="/finance"
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />

        <DashboardCard
          icon={UtensilsCrossed}
          title="Calories Today"
          value={`${todayCalories.toLocaleString()} kcal`}
          subtitle={`Target: ${calorieTarget.toLocaleString()} kcal`}
          href="/food"
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
}
