'use client';

import { useState, useEffect, useCallback } from 'react';
import { BookOpen, Loader2 } from 'lucide-react';
import { MediaItem, MediaType, MediaStatus } from '@/lib/types';
import MediaCard from '@/components/media/MediaCard';
import MediaFilters from '@/components/media/MediaFilters';

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async (filters?: {
    search: string;
    type: MediaType | '';
    status: MediaStatus | '';
  }) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters?.search) params.set('search', filters.search);
    if (filters?.type) params.set('type', filters.type);
    if (filters?.status) params.set('status', filters.status);

    try {
      const res = await fetch(`/api/media?${params.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setItems(data);
      }
    } catch (err) {
      console.error('Failed to fetch items:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return (
    <div className="px-4 pt-6">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">My Library</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Track your books & videos
        </p>
      </div>

      <MediaFilters onFilterChange={fetchItems} />

      <div className="mt-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={24} className="animate-spin text-gray-400" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">No items yet</p>
            <p className="text-gray-400 text-xs mt-1">
              Tap + to add your first book or video
            </p>
          </div>
        ) : (
          items.map((item) => <MediaCard key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
}
