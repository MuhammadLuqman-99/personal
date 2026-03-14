'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { MediaItem } from '@/lib/types';

export default function ReadingPage() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState<MediaItem | null>(null);
  const [currentPage, setCurrentPage] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function fetchItem() {
      try {
        const res = await fetch(`/api/media/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setItem(data);
          setCurrentPage(data.current_page?.toString() || '0');
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchItem();
  }, [params.id]);

  const savePage = useCallback(async (page: string) => {
    if (!page) return;
    setSaving(true);
    try {
      await fetch(`/api/media/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_page: parseInt(page) }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }, [params.id]);

  if (!item) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
            {item.title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Page</span>
          <input
            type="number"
            value={currentPage}
            onChange={(e) => setCurrentPage(e.target.value)}
            className="w-16 px-2 py-1.5 text-sm text-center border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            max={item.total_pages || undefined}
          />
          {item.total_pages && (
            <span className="text-xs text-gray-500">/ {item.total_pages}</span>
          )}
          <button
            onClick={() => savePage(currentPage)}
            disabled={saving}
            className={`p-1.5 rounded-lg transition-colors ${
              saved
                ? 'bg-green-100 text-green-600'
                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
            }`}
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
          </button>
        </div>
      </div>

      {/* PDF Viewer */}
      {item.pdf_url ? (
        <iframe
          src={item.pdf_url}
          className="flex-1 w-full border-0"
          title={item.title}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
          No PDF attached
        </div>
      )}
    </div>
  );
}
