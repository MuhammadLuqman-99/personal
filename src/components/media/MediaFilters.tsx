'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { MediaType, MediaStatus } from '@/lib/types';

interface MediaFiltersProps {
  onFilterChange: (filters: {
    search: string;
    type: MediaType | '';
    status: MediaStatus | '';
  }) => void;
}

export default function MediaFilters({ onFilterChange }: MediaFiltersProps) {
  const [search, setSearch] = useState('');
  const [type, setType] = useState<MediaType | ''>('');
  const [status, setStatus] = useState<MediaStatus | ''>('');

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ search, type, status });
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, type, status]);

  const typeOptions: { value: MediaType | ''; label: string }[] = [
    { value: '', label: 'All' },
    { value: 'book', label: 'Books' },
    { value: 'video', label: 'Videos' },
  ];

  const statusOptions: { value: MediaStatus | ''; label: string }[] = [
    { value: '', label: 'All' },
    { value: 'want', label: 'Want' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
  ];

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Type Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {typeOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setType(opt.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              type === opt.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
        <span className="text-gray-300 self-center">|</span>
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatus(opt.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              status === opt.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
