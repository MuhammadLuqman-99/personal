'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2, ExternalLink } from 'lucide-react';

interface PdfViewerProps {
  url: string;
  initialPage?: number;
  onPageChange?: (page: number) => void;
}

function isGoogleDriveUrl(url: string) {
  return url.includes('drive.google.com');
}

function getGoogleDriveEmbedUrl(url: string) {
  // Extract file ID from various Google Drive URL formats
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) {
    return `https://drive.google.com/file/d/${match[1]}/preview`;
  }
  return url;
}

function getGoogleDriveDirectUrl(url: string) {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) {
    return `https://www.googleapis.com/drive/v3/files/${match[1]}?alt=media&key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`;
  }
  return url;
}

export default function PdfViewer({ url, initialPage = 1, onPageChange }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfDocRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [useIframe, setUseIframe] = useState(false);

  // Load PDF document
  useEffect(() => {
    let cancelled = false;

    // Google Drive URLs - try direct URL first, fallback to iframe
    if (isGoogleDriveUrl(url)) {
      const directUrl = getGoogleDriveDirectUrl(url);

      async function loadGoogleDrivePdf() {
        try {
          setLoading(true);
          setError('');

          const pdfjsLib = await import('pdfjs-dist');
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

          const loadingTask = pdfjsLib.getDocument(directUrl);
          const pdf = await loadingTask.promise;

          if (cancelled) return;

          pdfDocRef.current = pdf;
          setTotalPages(pdf.numPages);
          const startPage = Math.min(Math.max(1, initialPage), pdf.numPages);
          setCurrentPage(startPage);
          setLoading(false);
        } catch {
          // Direct URL failed, use iframe embed
          if (!cancelled) {
            setUseIframe(true);
            setLoading(false);
          }
        }
      }

      loadGoogleDrivePdf();
      return () => { cancelled = true; };
    }

    // Non-Google Drive URLs - load normally
    async function loadPdf() {
      try {
        setLoading(true);
        setError('');

        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;

        if (cancelled) return;

        pdfDocRef.current = pdf;
        setTotalPages(pdf.numPages);
        const startPage = Math.min(Math.max(1, initialPage), pdf.numPages);
        setCurrentPage(startPage);
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load PDF:', err);
          setError('Failed to load PDF');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPdf();
    return () => { cancelled = true; };
  }, [url, initialPage]);

  // Render page
  const renderPage = useCallback(async (pageNum: number) => {
    const pdf = pdfDocRef.current;
    const canvas = canvasRef.current;
    if (!pdf || !canvas) return;

    try {
      const page = await pdf.getPage(pageNum);
      const containerWidth = containerRef.current?.clientWidth || window.innerWidth;

      const unscaledViewport = page.getViewport({ scale: 1 });
      const fitScale = (containerWidth - 16) / unscaledViewport.width;
      const finalScale = fitScale * scale;

      const viewport = page.getViewport({ scale: finalScale });

      const dpr = window.devicePixelRatio || 1;
      canvas.height = viewport.height * dpr;
      canvas.width = viewport.width * dpr;
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.scale(dpr, dpr);

      await page.render({
        canvasContext: ctx,
        viewport: viewport,
      }).promise;
    } catch (err) {
      console.error('Failed to render page:', err);
    }
  }, [scale]);

  useEffect(() => {
    if (pdfDocRef.current && currentPage > 0) {
      renderPage(currentPage);
    }
  }, [currentPage, renderPage]);

  function goToPage(page: number) {
    const clamped = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(clamped);
    onPageChange?.(clamped);
  }

  function zoom(delta: number) {
    setScale((prev) => Math.min(Math.max(0.5, prev + delta), 3));
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center text-red-500 text-sm">
        {error}
      </div>
    );
  }

  // Google Drive iframe fallback
  if (useIframe) {
    const embedUrl = getGoogleDriveEmbedUrl(url);
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
          <span className="text-xs text-gray-500">Google Drive PDF</span>
          <a
            href={url.replace('/preview', '/view')}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
          >
            <ExternalLink size={12} />
            Open in Drive
          </a>
        </div>
        <iframe
          src={embedUrl}
          className="flex-1 w-full border-0"
          allow="autoplay"
          sandbox="allow-scripts allow-same-origin allow-popups"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-1">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-30"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-xs text-gray-600 min-w-[60px] text-center">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => zoom(-0.25)}
            disabled={scale <= 0.5}
            className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-30"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-xs text-gray-500 min-w-[40px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => zoom(0.25)}
            disabled={scale >= 3}
            className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-30"
          >
            <ZoomIn size={16} />
          </button>
        </div>
      </div>

      {/* PDF Canvas */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-gray-200 flex justify-center"
      >
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-gray-400" />
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            className="block my-2 shadow-lg"
          />
        )}
      </div>
    </div>
  );
}
