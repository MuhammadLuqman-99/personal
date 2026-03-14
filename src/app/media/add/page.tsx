'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import MediaForm from '@/components/media/MediaForm';

export default function AddMediaPage() {
  return (
    <div className="px-4 pt-6">
      <div className="flex items-center gap-3 mb-5">
        <Link
          href="/media"
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Add New</h1>
      </div>

      <MediaForm mode="create" />
    </div>
  );
}
