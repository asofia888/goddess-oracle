export type Language = 'ja' | 'en';

export interface Translations {
  appTitle: string;
  subtitle: string;
  singleCard: string;
  threeCards: string;
  shuffleCards: string;
  journal: string;
  manual: string;
  disclaimer: string;
  past: string;
  present: string;
  future: string;
  cardReading: string;
  threeCardSpread: string;
  close: string;
  clearAll: string;
  noReadings: string;
  readingHistory: string;
  howToUse: string;
  important: string;
  entertainment: string;
  disclaimerText: string;
  iUnderstand: string;
  manualContent: {
    title: string;
    singleCardTitle: string;
    singleCardDesc: string;
    threeCardTitle: string;
    threeCardDesc: string;
    journalTitle: string;
    journalDesc: string;
  };
}

export const translations: Record<Language, Translations> = {
  ja: {
    appTitle: '女神のオラクル',
    subtitle: 'ガイダンス',
    singleCard: '1枚引き',
    threeCards: '3枚引き',
    shuffleCards: 'カードをシャッフル',
    journal: 'ジャーナル',
    manual: '使い方',
    disclaimer: '免責事項',
    past: '過去',
    present: '現在',
    future: '未来',
    cardReading: 'カードリーディング',
    threeCardSpread: '3枚引きスプレッド',
    close: '閉じる',
    clearAll: 'すべて削除',
    noReadings: 'まだリーディングがありません',
    readingHistory: 'リーディング履歴',
    howToUse: '使い方',
    important: '重要',
    entertainment: 'エンターテイメント',
    disclaimerText: 'このアプリは娯楽目的で作成されており、実際の占いや霊的指導を提供するものではありません。重要な人生の決断は、適切な専門家にご相談ください。',
    iUnderstand: '理解しました',
    manualContent: {
      title: '女神のオラクルガイダンス 使い方',
      singleCardTitle: '1枚引き',
      singleCardDesc: '一つの質問や状況について、深い洞察を得たい時に使用します。カードをクリックして選択してください。',
      threeCardTitle: '3枚引き（過去・現在・未来）',
      threeCardDesc: '時間の流れの中で状況を理解したい時に使用します。3枚のカードを順番に選択してください。',
      journalTitle: 'ジャーナル機能',
      journalDesc: '過去のリーディング結果を確認できます。あなたの成長の記録として活用してください。'
    }
  },
  en: {
    appTitle: 'Goddess Oracle',
    subtitle: 'Guidance',
    singleCard: 'Single Card',
    threeCards: 'Three Cards',
    shuffleCards: 'Shuffle Cards',
    journal: 'Journal',
    manual: 'How to Use',
    disclaimer: 'Disclaimer',
    past: 'Past',
    present: 'Present',
    future: 'Future',
    cardReading: 'Card Reading',
    threeCardSpread: 'Three Card Spread',
    close: 'Close',
    clearAll: 'Clear All',
    noReadings: 'No readings yet',
    readingHistory: 'Reading History',
    howToUse: 'How to Use',
    important: 'Important',
    entertainment: 'Entertainment',
    disclaimerText: 'This app is created for entertainment purposes and does not provide actual divination or spiritual guidance. Please consult appropriate professionals for important life decisions.',
    iUnderstand: 'I Understand',
    manualContent: {
      title: 'Goddess Oracle Guidance - How to Use',
      singleCardTitle: 'Single Card Reading',
      singleCardDesc: 'Use this when you want deep insight about a specific question or situation. Click to select a card.',
      threeCardTitle: 'Three Card Reading (Past, Present, Future)',
      threeCardDesc: 'Use this when you want to understand a situation within the flow of time. Select three cards in sequence.',
      journalTitle: 'Journal Feature',
      journalDesc: 'Review your past reading results. Use this as a record of your personal growth.'
    }
  }
};

export const detectLanguage = (): Language => {
  if (typeof window === 'undefined') return 'en';

  const browserLang = navigator.language || navigator.languages?.[0] || 'en';

  // 日本語圏の判定
  if (browserLang.startsWith('ja')) {
    return 'ja';
  }

  return 'en';
};

export const getTranslation = (language: Language): Translations => {
  return translations[language];
};