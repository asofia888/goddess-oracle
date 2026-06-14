import type { GoddessCardData, SavedReading } from '../../types';
import type { Translations } from '../../utils/i18n';

export const mockCard: GoddessCardData = {
  id: 1,
  name: 'Aphrodite',
  description: 'Greek goddess of love and beauty',
  message: 'Open your heart to love.',
  theme: 'Love & Beauty',
  secondaryThemes: ['Self-love', 'Relationships'],
  origin: 'Greek Mythology',
  element: 'water',
  keywords: ['love', 'beauty', 'compassion'],
  affirmation: 'I am worthy of love.',
  dailyGuidance: ['Practice self-care', 'Express gratitude', 'Be kind to yourself'],
  colors: ['pink', 'gold'],
  symbols: ['rose', 'mirror'],
};

export const mockCardJa: GoddessCardData = {
  id: 2,
  name: 'アマテラス',
  description: '日本神話の太陽の女神',
  message: 'あなたの内なる光を輝かせて。',
  theme: '光と再生',
  secondaryThemes: ['自己実現', '希望'],
  origin: 'Japanese Mythology',
  element: 'fire',
  keywords: ['光', '太陽', '再生'],
  affirmation: '私は自らの光で世界を照らします。',
  dailyGuidance: ['朝日を浴びる', '感謝の気持ちを持つ', '自分を信じる'],
  colors: ['gold', 'red'],
  symbols: ['sun', 'mirror'],
};

export const mockThreeCards: GoddessCardData[] = [
  mockCard,
  {
    ...mockCard,
    id: 2,
    name: 'Artemis',
    description: 'Greek goddess of the hunt',
    message: 'Trust your instincts.',
    theme: 'Independence',
  },
  {
    ...mockCard,
    id: 3,
    name: 'Athena',
    description: 'Greek goddess of wisdom',
    message: 'Seek wisdom within.',
    theme: 'Wisdom',
  },
];

export const mockReading: SavedReading = {
  id: 'reading-1',
  date: '2025-01-01 12:00',
  mode: 'single',
  cards: [mockCard],
  generatedMessages: ['A beautiful oracle message for you.'],
  generatedImageUrl: '/images/aphrodite/1.webp',
  readingLevel: 'normal',
};

export const mockThreeCardReading: SavedReading = {
  id: 'reading-2',
  date: '2025-01-02 14:00',
  mode: 'three',
  cards: mockThreeCards,
  generatedMessages: ['Past message', 'Present message', 'Future message'],
  generatedImageUrl: null,
  readingLevel: 'deep',
};

export const mockTranslationsEn: Translations = {
  appTitle: 'Goddess Oracle Guidance',
  subtitle: '',
  singleCard: 'Single Card',
  threeCards: 'Three Cards',
  shuffleCards: 'Shuffle',
  journal: 'Journal',
  manual: 'Manual',
  disclaimer: 'Disclaimer',
  past: 'Past',
  present: 'Present',
  future: 'Future',
  cardReading: 'Card Reading',
  threeCardSpread: 'Three Card Spread',
  close: 'Close',
  clearAll: 'Clear All',
  noReadings: 'No readings yet.',
  readingHistory: 'Reading History',
  theme: 'Theme',
  affirmation: 'Affirmation',
  dailyGuidance: 'Daily Guidance',
  loadingMessage: 'Loading message...',
  loadingGoddessImage: 'Loading image...',
  loadingThreeCards: 'Loading three cards...',
  loadingImages: 'Loading images...',
  saveReading: 'Save Reading',
  saved: 'Saved!',
  save: 'Save',
  howToUse: 'How to Use',
  important: 'Important',
  entertainment: 'Entertainment',
  disclaimerText:
    'This app is created for entertainment purposes and does not provide actual divination or spiritual guidance. Please consult appropriate professionals for important life decisions.',
  iUnderstand: 'I Understand',
  manualContent: {
    title: 'Goddess Oracle Guidance - How to Use',
    singleCardTitle: 'Single Card Reading',
    singleCardDesc:
      'Use this when you want deep insight about a specific question or situation. Click to select a card.',
    threeCardTitle: 'Three Card Reading (Past, Present, Future)',
    threeCardDesc:
      'Use this when you want to understand a situation within the flow of time. Select three cards in sequence.',
    journalTitle: 'Journal Feature',
    journalDesc:
      'Review your past reading results. Use this as a record of your personal growth.',
  },
};
