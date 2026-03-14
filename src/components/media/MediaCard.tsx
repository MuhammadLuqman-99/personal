'use client';

import Link from 'next/link';
import { BookOpen, Video } from 'lucide-react';
import { MediaItem } from '@/lib/types';
import { getYouTubeThumbnail } from '@/lib/utils';
import ProgressBar from './ProgressBar';
import StatusBadge from './StatusBadge';

interface MediaCardProps {
  item: MediaItem;
}

export default function MediaCard({ item }: MediaCardProps) {
  const thumbnail = item.type === 'video' ? getYouTubeThumbnail(item.video_url) : null;

  return (
    <Link href={`/media/${item.id}`} className="block">
      <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow active:bg-gray-50">
        <div className="flex gap-3">
          {/* Icon or Thumbnail */}
          <div className="flex-shrink-0">
            {thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumbnail}
                alt=""
                className="w-16 h-12 object-cover rounded-lg"
              />
            ) : (
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                item.type === 'book' ? 'bg-purple-100' : 'bg-red-100'
              }`}>
                {item.type === 'book' ? (
                  <BookOpen size={20} className="text-purple-600" />
                ) : (
                  <Video size={20} className="text-red-600" />
                )}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-gray-900 truncate text-sm">
                {item.title}
              </h3>
              <StatusBadge status={item.status} />
            </div>

            {/* Progress bar for books */}
            {item.type === 'book' && item.total_pages && (
              <div className="mt-2">
                <ProgressBar
                  currentPage={item.current_page}
                  totalPages={item.total_pages}
                />
              </div>
            )}

            {/* Notes preview */}
            {item.notes && (
              <p className="text-xs text-gray-500 mt-1 truncate">
                {item.notes}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
