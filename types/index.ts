// Core types for the Goddess Oracle application

export type ReadingLevel = 'normal' | 'deep';

export type ReadingMode = 'single' | 'three';

export type Language = 'ja' | 'en' | 'es' | 'fr';

export type Element = 'fire' | 'water' | 'earth' | 'air' | 'spirit';

export interface GoddessCardData {
  id: number;
  name: string;
  description: string;
  message: string;
  // Enhanced card properties
  theme: string;
  secondaryThemes: string[];
  origin: string;
  element: Element;
  keywords: string[];
  affirmation: string;
  dailyGuidance: string[];
  colors: string[];
  symbols: string[];
}

export interface SavedReading {
  id: string;
  date: string;
  mode: ReadingMode;
  cards: GoddessCardData[];
  generatedMessages: (string | null)[];
  generatedImageUrl: string | null;
  readingLevel: ReadingLevel;
}

export type NewReading = Omit<SavedReading, 'id' | 'date'>;

// Translation types
export interface Translations {
  appTitle: string;
  singleCard: string;
  threeCards: string;
  disclaimer: string;
  manual: string;
}