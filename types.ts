
export type ReadingLevel = 'normal' | 'deep';

export interface GoddessCardData {
  id: number;
  name: string;
  description: string;
  message: string;
  // 新しいフィールド
  theme: string;
  secondaryThemes: string[];
  origin: string;
  element: 'fire' | 'water' | 'earth' | 'air' | 'spirit';
  keywords: string[];
  affirmation: string;
  dailyGuidance: string[];
  colors: string[];
  symbols: string[];
}

export interface SavedReading {
  id: string;
  date: string;
  mode: 'single' | 'three';
  cards: GoddessCardData[];
  generatedMessages: (string | null)[];
  generatedImageUrl: string | null;
  readingLevel: ReadingLevel;
}

export type NewReading = Omit<SavedReading, 'id' | 'date'>;

// FIX: Add GenerateMessageRequestBody type for the message generation API endpoint.
export interface GenerateMessageRequestBody {
  cards: GoddessCardData[];
  mode: 'single' | 'three';
  language?: 'ja' | 'en';
}

// FIX: Add GenerateImageRequestBody type for the image generation API endpoint.
export interface GenerateImageRequestBody {
  prompt: string;
}