'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { MediaItem } from '@/lib/types';
import PdfViewer from '@/components/media/PdfViewer';

export default function ReadingPage() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState<MediaItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function fetchItem() {
      try {
        const res = await fetch(`/api/media/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setItem(data);
          setCurrentPage(data.current_page || 1);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchItem();
  }, [params.id]);

  const savePage = useCallback(async (page: number) => {
    setSaving(true);
    try {
      await fetch(`/api/media/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_page: page,
          status: 'in_progress',
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }, [params.id]);

  function handlePageChange(page: number) {
    setCurrentPage(page);
  }

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
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
            {item.title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            Page {currentPage}
            {item.total_pages ? ` / ${item.total_pages}` : ''}
          </span>
          <button
            onClick={() => savePage(currentPage)}
            disabled={saving}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              saved
                ? 'bg-green-100 text-green-600'
                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
            }`}
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            {saved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>

      {/* PDF Viewer */}
      {item.pdf_url ? (
        <PdfViewer
          url={item.pdf_url}
          initialPage={item.current_page || 1}
          onPageChange={handlePageChange}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
          No PDF attached
        </div>
      )}
    </div>
  );
}
