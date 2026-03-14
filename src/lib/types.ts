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

// Finance types
export type ExpenseCategory = 'food' | 'transport' | 'shopping' | 'bills' | 'entertainment' | 'other';

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  note: string | null;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface CreateExpenseInput {
  amount: number;
  category: ExpenseCategory;
  note?: string;
  date?: string;
}

export interface UpdateExpenseInput {
  amount?: number;
  category?: ExpenseCategory;
  note?: string;
  date?: string;
}

// Food types
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FoodLog {
  id: string;
  meal_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal_type: MealType;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFoodLogInput {
  meal_name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  meal_type: MealType;
  date?: string;
}

export interface UpdateFoodLogInput {
  meal_name?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  meal_type?: MealType;
  date?: string;
}
