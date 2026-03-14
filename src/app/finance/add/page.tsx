'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ExpenseForm from '@/components/finance/ExpenseForm';

export default function AddExpensePage() {
  return (
    <div className="px-4 pt-6">
      <div className="flex items-center gap-3 mb-5">
        <Link
          href="/finance"
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Add Expense</h1>
      </div>

      <ExpenseForm />
    </div>
  );
}
