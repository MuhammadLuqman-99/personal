export type MediaType = 'book' | 'video';
export type MediaStatus = 'want' | 'in_progress' | 'completed';

export interface MediaItem {
  id: string;
  type: MediaType;
  title: string;
  status: MediaStatus;
  current_page: number | null;
  total_pages: number | null;
  pdf_url: string | null;
  video_url: string | null;
  notes: string | null;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateMediaInput {
  type: MediaType;
  title: string;
  status?: MediaStatus;
  current_page?: number;
  total_pages?: number;
  pdf_url?: string;
  video_url?: string;
  notes?: string;
  cover_image_url?: string;
}

export interface UpdateMediaInput {
  title?: string;
  status?: MediaStatus;
  current_page?: number;
  total_pages?: number;
  pdf_url?: string;
  video_url?: string;
  notes?: string;
  cover_image_url?: string;
}
