export type Language = 'ja' | 'en' | 'es' | 'fr';

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
  theme: string;
  affirmation: string;
  dailyGuidance: string;
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
    theme: 'テーマ',
    affirmation: 'アファメーション',
    dailyGuidance: '日常のガイダンス',
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
    theme: 'Theme',
    affirmation: 'Affirmation',
    dailyGuidance: 'Daily Guidance',
    manualContent: {
      title: 'Goddess Oracle Guidance - How to Use',
      singleCardTitle: 'Single Card Reading',
      singleCardDesc: 'Use this when you want deep insight about a specific question or situation. Click to select a card.',
      threeCardTitle: 'Three Card Reading (Past, Present, Future)',
      threeCardDesc: 'Use this when you want to understand a situation within the flow of time. Select three cards in sequence.',
      journalTitle: 'Journal Feature',
      journalDesc: 'Review your past reading results. Use this as a record of your personal growth.'
    }
  },
  es: {
    appTitle: 'Oráculo de la Diosa',
    subtitle: 'Guía Espiritual',
    singleCard: 'Una Carta',
    threeCards: 'Tres Cartas',
    shuffleCards: 'Barajar Cartas',
    journal: 'Diario',
    manual: 'Cómo Usar',
    disclaimer: 'Descargo de Responsabilidad',
    past: 'Pasado',
    present: 'Presente',
    future: 'Futuro',
    cardReading: 'Lectura de Cartas',
    threeCardSpread: 'Tirada de Tres Cartas',
    close: 'Cerrar',
    clearAll: 'Borrar Todo',
    noReadings: 'Aún no hay lecturas',
    readingHistory: 'Historial de Lecturas',
    howToUse: 'Cómo Usar',
    important: 'Importante',
    entertainment: 'Entretenimiento',
    disclaimerText: 'Esta aplicación está creada con fines de entretenimiento y no proporciona adivinación real o guía espiritual. Por favor, consulte a profesionales apropiados para decisiones importantes de la vida.',
    iUnderstand: 'Entiendo',
    theme: 'Tema',
    affirmation: 'Afirmación',
    dailyGuidance: 'Guía Diaria',
    manualContent: {
      title: 'Guía del Oráculo de la Diosa - Cómo Usar',
      singleCardTitle: 'Lectura de Una Carta',
      singleCardDesc: 'Úsala cuando quieras una percepción profunda sobre una pregunta o situación específica. Haz clic para seleccionar una carta.',
      threeCardTitle: 'Lectura de Tres Cartas (Pasado, Presente, Futuro)',
      threeCardDesc: 'Úsala cuando quieras entender una situación en el flujo del tiempo. Selecciona tres cartas en secuencia.',
      journalTitle: 'Función de Diario',
      journalDesc: 'Revisa los resultados de tus lecturas pasadas. Úsalo como un registro de tu crecimiento personal.'
    }
  },
  fr: {
    appTitle: 'Oracle de la Déesse',
    subtitle: 'Guidance Spirituelle',
    singleCard: 'Une Carte',
    threeCards: 'Trois Cartes',
    shuffleCards: 'Mélanger les Cartes',
    journal: 'Journal',
    manual: 'Mode d\'emploi',
    disclaimer: 'Avertissement',
    past: 'Passé',
    present: 'Présent',
    future: 'Futur',
    cardReading: 'Lecture de Cartes',
    threeCardSpread: 'Tirage à Trois Cartes',
    close: 'Fermer',
    clearAll: 'Tout Effacer',
    noReadings: 'Aucune lecture pour l\'instant',
    readingHistory: 'Historique des Lectures',
    howToUse: 'Mode d\'emploi',
    important: 'Important',
    entertainment: 'Divertissement',
    disclaimerText: 'Cette application est créée à des fins de divertissement et ne fournit pas de vraie divination ou de guidance spirituelle. Veuillez consulter des professionnels appropriés pour les décisions importantes de la vie.',
    iUnderstand: 'Je Comprends',
    theme: 'Thème',
    affirmation: 'Affirmation',
    dailyGuidance: 'Guidance Quotidienne',
    manualContent: {
      title: 'Guide de l\'Oracle de la Déesse - Mode d\'emploi',
      singleCardTitle: 'Lecture d\'Une Carte',
      singleCardDesc: 'Utilisez-la quand vous voulez une perception profonde sur une question ou situation spécifique. Cliquez pour sélectionner une carte.',
      threeCardTitle: 'Lecture de Trois Cartes (Passé, Présent, Futur)',
      threeCardDesc: 'Utilisez-la quand vous voulez comprendre une situation dans le flux du temps. Sélectionnez trois cartes en séquence.',
      journalTitle: 'Fonction Journal',
      journalDesc: 'Revoyez vos résultats de lectures passées. Utilisez-le comme un enregistrement de votre croissance personnelle.'
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

  // スペイン語圏の判定
  if (browserLang.startsWith('es')) {
    return 'es';
  }

  // フランス語圏の判定
  if (browserLang.startsWith('fr')) {
    return 'fr';
  }

  return 'en';
};

export const getTranslation = (language: Language): Translations => {
  return translations[language];
};