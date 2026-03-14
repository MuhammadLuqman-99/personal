'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2, ExternalLink, BookOpen, Loader2 } from 'lucide-react';
import { MediaItem } from '@/lib/types';
import { getYouTubeEmbedUrl } from '@/lib/utils';
import MediaForm from '@/components/media/MediaForm';
import ProgressBar from '@/components/media/ProgressBar';
import StatusBadge from '@/components/media/StatusBadge';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Toast from '@/components/ui/Toast';

export default function MediaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    async function fetchItem() {
      try {
        const res = await fetch(`/api/media/${params.id}`);
        if (res.ok) {
          setItem(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchItem();
  }, [params.id]);

  async function handleDelete() {
    setShowConfirm(true);
  }

  async function confirmDelete() {
    setShowConfirm(false);
    setDeleting(true);
    try {
      await fetch(`/api/media/${params.id}`, { method: 'DELETE' });
      setToast({ message: 'Item deleted', type: 'success' });
      setTimeout(() => {
        router.push('/media');
        router.refresh();
      }, 500);
    } catch {
      setDeleting(false);
      setToast({ message: 'Failed to delete', type: 'error' });
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="px-4 pt-6 text-center">
        <p className="text-gray-500">Item not found</p>
        <Link href="/media" className="text-blue-600 text-sm mt-2 inline-block">
          Go back
        </Link>
      </div>
    );
  }

  const embedUrl = getYouTubeEmbedUrl(item.video_url);

  if (editing) {
    return (
      <div className="px-4 pt-6">
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => setEditing(false)}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Edit</h1>
        </div>
        <MediaForm item={item} mode="edit" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/media"
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-lg font-bold text-gray-900 truncate max-w-[200px]">
            {item.title}
          </h1>
        </div>
        <StatusBadge status={item.status} />
      </div>

      {item.type === 'video' && embedUrl && (
        <div className="aspect-video rounded-xl overflow-hidden bg-black mb-4">
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {item.type === 'video' && item.video_url && !embedUrl && (
        <a
          href={item.video_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-blue-600 text-sm mb-4 hover:underline"
        >
          <ExternalLink size={16} />
          Open video link
        </a>
      )}

      {item.type === 'book' && item.total_pages && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <ProgressBar currentPage={item.current_page} totalPages={item.total_pages} />
        </div>
      )}

      {item.type === 'book' && item.pdf_url && (
        <Link
          href={`/media/${item.id}/reading`}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-purple-600 text-white font-medium text-sm hover:bg-purple-700 transition-colors mb-4"
        >
          <BookOpen size={16} />
          Continue Reading
        </Link>
      )}

      {item.notes && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-1">Notes</h3>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{item.notes}</p>
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <button
          onClick={() => setEditing(true)}
          className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-4 py-3 rounded-xl bg-red-50 text-red-600 font-medium text-sm hover:bg-red-100 transition-colors disabled:opacity-50"
        >
          {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
        </button>
      </div>

      {showConfirm && (
        <ConfirmModal
          title="Delete Item"
          message="Are you sure you want to delete this item? This cannot be undone."
          onConfirm={confirmDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
