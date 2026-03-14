'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Loader2, Link as LinkIcon } from 'lucide-react';
import { MediaItem, MediaType, MediaStatus } from '@/lib/types';
import { useGoogleDrivePicker } from '@/lib/useGoogleDrivePicker';

interface MediaFormProps {
  item?: MediaItem;
  mode: 'create' | 'edit';
}

export default function MediaForm({ item, mode }: MediaFormProps) {
  const router = useRouter();
  const { openPicker } = useGoogleDrivePicker();

  const [type, setType] = useState<MediaType>(item?.type || 'book');
  const [title, setTitle] = useState(item?.title || '');
  const [status, setStatus] = useState<MediaStatus>(item?.status || 'want');
  const [currentPage, setCurrentPage] = useState(item?.current_page?.toString() || '');
  const [totalPages, setTotalPages] = useState(item?.total_pages?.toString() || '');
  const [pdfUrl, setPdfUrl] = useState(item?.pdf_url || '');
  const [videoUrl, setVideoUrl] = useState(item?.video_url || '');
  const [notes, setNotes] = useState(item?.notes || '');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [error, setError] = useState('');

  function handleDrivePicker() {
    setUploading(true);
    setError('');
    openPicker((result) => {
      setUploading(false);
      if (result) {
        setPdfUrl(result.url);
        if (!title && result.name) {
          setTitle(result.name.replace(/\.pdf$/i, ''));
        }
      }
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError('');

    const body = {
      type,
      title: title.trim(),
      status,
      current_page: currentPage ? parseInt(currentPage) : null,
      total_pages: totalPages ? parseInt(totalPages) : null,
      pdf_url: pdfUrl || null,
      video_url: videoUrl || null,
      notes: notes.trim() || null,
    };

    try {
      const url = mode === 'create' ? '/api/media' : `/api/media/${item?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(mode === 'create' ? `/media/${data.id}` : '/media');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Something went wrong');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Type Toggle */}
      <div>
        <label className={labelClass}>Type</label>
        <div className="flex gap-2">
          {(['book', 'video'] as MediaType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                type === t
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {t === 'book' ? 'Book / PDF' : 'Video'}
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className={labelClass}>Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={type === 'book' ? 'Book title...' : 'Video title...'}
          className={inputClass}
          required
        />
      </div>

      {/* Status */}
      <div>
        <label className={labelClass}>Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as MediaStatus)}
          className={inputClass}
        >
          <option value="want">{type === 'book' ? 'Want to Read' : 'Want to Watch'}</option>
          <option value="in_progress">{type === 'book' ? 'Reading' : 'Watching'}</option>
          <option value="completed">{type === 'book' ? 'Read' : 'Watched'}</option>
        </select>
      </div>

      {/* Book-specific fields */}
      {type === 'book' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Current Page</label>
              <input
                type="number"
                value={currentPage}
                onChange={(e) => setCurrentPage(e.target.value)}
                placeholder="0"
                min="0"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Total Pages</label>
              <input
                type="number"
                value={totalPages}
                onChange={(e) => setTotalPages(e.target.value)}
                placeholder="0"
                min="0"
                className={inputClass}
              />
            </div>
          </div>

          {/* PDF - Google Drive or Link */}
          <div>
            <label className={labelClass}>PDF</label>
            {pdfUrl ? (
              <div className="bg-green-50 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <LinkIcon size={14} className="text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-green-700 truncate">PDF linked</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPdfUrl('')}
                    className="text-red-500 text-xs font-medium hover:underline flex-shrink-0 ml-2"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleDrivePicker}
                    disabled={uploading}
                    className="flex-1 py-3 rounded-xl bg-blue-50 text-blue-700 font-medium text-sm hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 border border-blue-200"
                  >
                    {uploading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Upload size={16} />
                    )}
                    {uploading ? 'Opening Drive...' : 'Upload to Google Drive'}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLinkInput(!showLinkInput)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Or paste a link manually
                </button>
                {showLinkInput && (
                  <input
                    type="url"
                    value={pdfUrl}
                    onChange={(e) => setPdfUrl(e.target.value)}
                    placeholder="Paste PDF link (Google Drive, Dropbox, etc.)..."
                    className={inputClass}
                  />
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Video-specific fields */}
      {type === 'video' && (
        <div>
          <label className={labelClass}>Video URL</label>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className={inputClass}
          />
        </div>
      )}

      {/* Notes */}
      <div>
        <label className={labelClass}>Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Your notes..."
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {mode === 'create' ? 'Add Item' : 'Save Changes'}
      </button>
    </form>
  );
}
