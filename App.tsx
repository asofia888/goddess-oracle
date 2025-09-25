
import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import type { GoddessCardData, SavedReading, ReadingLevel, ReadingMode, Language } from './types';
import OracleCard from './components/OracleCard';
import LanguageSelector from './components/LanguageSelector';
import ErrorBoundary from './components/shared/ErrorBoundary';
import { getReadings, clearReadings } from './utils/storage';
import { detectLanguage, getTranslation } from './utils/i18n';

// Dynamic imports for heavy modal components
const MessageModal = lazy(() => import('./components/MessageModal'));
const JournalModal = lazy(() => import('./components/JournalModal'));
const DisclaimerModal = lazy(() => import('./components/DisclaimerModal'));
const ManualModal = lazy(() => import('./components/ManualModal'));

// Fisher-Yates shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};


const App: React.FC = () => {
  const [cards, setCards] = useState<GoddessCardData[]>([]);
  const [selectedCards, setSelectedCards] = useState<GoddessCardData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [readingMode, setReadingMode] = useState<ReadingMode>('single');
  const [readingLevel, setReadingLevel] = useState<ReadingLevel>('normal');
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [readings, setReadings] = useState<SavedReading[]>([]);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [randomStyles, setRandomStyles] = useState<React.CSSProperties[]>([]);
  const [language, setLanguage] = useState<Language>('en');
  const [t, setT] = useState(getTranslation('en'));


  const shuffleAndSetCards = useCallback(async () => {
    try {
      const { GODDESS_CARDS } = await import('./constants');
      setCards(shuffleArray(GODDESS_CARDS));
    } catch (error) {
      console.error('Error loading goddess cards:', error);
    }
  }, []);

  useEffect(() => {
    const detectedLang = detectLanguage();
    setLanguage(detectedLang);
    setT(getTranslation(detectedLang));

    // Load goddess cards dynamically
    const loadCards = async () => {
      try {
        const { GODDESS_CARDS } = await import('./constants');
        setCards(shuffleArray(GODDESS_CARDS));
      } catch (error) {
        console.error('Error loading goddess cards:', error);
        setCards([]);
      }
    };

    loadCards();

    // Load readings with error handling
    try {
      const initialReadings = getReadings();
      setReadings(initialReadings);
    } catch (error) {
      console.error('Error loading initial readings:', error);
      setReadings([]); // Fallback to empty array
    }
  }, []);

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setT(getTranslation(newLanguage));
  };
  
  const performAnimatedShuffle = useCallback(async () => {
    if (isAnimating) return;

    try {
      const { GODDESS_CARDS } = await import('./constants');

      // 拡散アニメーション用のスタイルを生成
      const styles = GODDESS_CARDS.map(
        () =>
          ({
            '--translateX': `${(Math.random() - 0.5) * 150}vw`,
            '--translateY': `${(Math.random() - 0.5) * 150}vh`,
            '--rotate-end': `${(Math.random() - 0.5) * 1080}deg`,
          } as React.CSSProperties)
      );
      setRandomStyles(styles);

      setSelectedCards([]);
      setIsAnimating(true);

      // アニメーション完了後にカードを入れ替えて再表示
      setTimeout(async () => {
        await shuffleAndSetCards();
        setIsAnimating(false);
      }, 1000); // CSSアニメーションの時間に合わせる
    } catch (error) {
      console.error('Error in animated shuffle:', error);
    }
  }, [isAnimating, shuffleAndSetCards]);

  const handleCardSelect = (card: GoddessCardData) => {
    if (isAnimating || isModalOpen) return;

    if (readingMode === 'single') {
      setSelectedCards([card]);
      setIsModalOpen(true);
    } else {
      if (selectedCards.length < 3 && !selectedCards.find(c => c.id === card.id)) {
        setSelectedCards(prev => [...prev, card]);
      }
    }
  };

  const handleReset = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      performAnimatedShuffle();
    }, 300); // Wait for modal animation
  };

  const handleSaveReading = () => {
    // Refresh readings from storage with error handling
    try {
      const freshReadings = getReadings();
      setReadings(freshReadings);
    } catch (error) {
      console.error('Error refreshing readings:', error);
      // Keep existing readings if refresh fails
    }
  };
  
  const handleModeChange = (mode: ReadingMode) => {
    setReadingMode(mode);
    performAnimatedShuffle();
  };

  const handleLevelChange = (level: ReadingLevel) => {
    setReadingLevel(level);
  };
  
  const getInstructionText = () => {
    if (readingMode === 'single') {
      if (language === 'ja') {
        return 'カードを1枚選んで、導きのメッセージを受け取りましょう。';
      } else if (language === 'es') {
        return 'Selecciona una carta para recibir tu mensaje de guía.';
      } else if (language === 'fr') {
        return 'Sélectionnez une carte pour recevoir votre message de guidance.';
      } else {
        return 'Select one card to receive your guidance message.';
      }
    }

    if (language === 'ja') {
      return `過去、現在、未来を示すカードを3枚選んでください。(${selectedCards.length}/3)`;
    } else if (language === 'es') {
      return `Por favor selecciona 3 cartas que representen pasado, presente y futuro. (${selectedCards.length}/3)`;
    } else if (language === 'fr') {
      return `Veuillez sélectionner 3 cartes représentant le passé, le présent et l'avenir. (${selectedCards.length}/3)`;
    } else {
      return `Please select 3 cards representing past, present, and future. (${selectedCards.length}/3)`;
    }
  }

  const handleClearHistory = () => {
    clearReadings();
    setReadings([]);
  };

  return (
    <ErrorBoundary language={language}>
    <div className="min-h-screen bg-violet-50 text-slate-800 p-4 sm:p-8 overflow-hidden">
      <header className="text-center mb-4 animate-fadeIn">
        {/* Mobile layout: Controls above logo */}
        <div className="flex justify-center mb-4 sm:hidden">
          <div className="flex items-center space-x-2">
            <LanguageSelector
              currentLanguage={language}
              onLanguageChange={handleLanguageChange}
            />
            <button
              onClick={() => setIsManualOpen(true)}
              className="p-2 rounded-full text-amber-700/80 hover:bg-amber-200/50 transition-colors"
              aria-label={t.manual}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button
              onClick={() => setIsJournalOpen(true)}
              className="p-2 rounded-full text-amber-700/80 hover:bg-amber-200/50 transition-colors"
              aria-label="リーディング履歴を開く"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </button>
          </div>
        </div>

        {/* Desktop layout: Controls positioned absolutely */}
        <div className="relative hidden sm:block">
          <div className="absolute top-0 right-0 h-full flex items-center space-x-2">
            <LanguageSelector
              currentLanguage={language}
              onLanguageChange={handleLanguageChange}
            />
            <button
              onClick={() => setIsManualOpen(true)}
              className="p-2 rounded-full text-amber-700/80 hover:bg-amber-200/50 transition-colors"
              aria-label={t.manual}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button
              onClick={() => setIsJournalOpen(true)}
              className="p-2 rounded-full text-amber-700/80 hover:bg-amber-200/50 transition-colors"
              aria-label="リーディング履歴を開く"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </button>
          </div>
        </div>

        <img src="/logo.png" alt="女神のオラクル ロゴ" className="mx-auto mb-4" style={{width: '180px', height: '180px'}} />
        <h1 className="text-4xl sm:text-6xl font-bold text-orange-900/90 tracking-wider">{t.appTitle}</h1>
      </header>

      <div className="flex justify-center items-center mt-6 mb-2 space-x-2 sm:space-x-4 bg-amber-200/50 p-1 rounded-full w-fit mx-auto shadow-inner">
        <button 
          onClick={() => handleModeChange('single')}
          className={`px-4 sm:px-6 py-2 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 ${readingMode === 'single' ? 'bg-white shadow text-amber-800' : 'text-amber-700/80 hover:bg-white/50'}`}
        >
          {t.singleCard}
        </button>
        <button 
          onClick={() => handleModeChange('three')}
          className={`px-4 sm:px-6 py-2 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 ${readingMode === 'three' ? 'bg-white shadow text-amber-800' : 'text-amber-700/80 hover:bg-white/50'}`}
        >
          {t.threeCards}
        </button>
      </div>

      <div className="flex justify-center items-center mb-6 space-x-2 sm:space-x-4 bg-purple-200/40 p-1 rounded-full w-fit mx-auto shadow-inner animate-fadeIn" style={{ animationDelay: '100ms' }}>
        <button
          onClick={() => handleLevelChange('normal')}
          className={`px-4 sm:px-6 py-2 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 ${readingLevel === 'normal' ? 'bg-white shadow text-purple-800' : 'text-purple-700/80 hover:bg-white/50'}`}
        >
          {language === 'ja' ? '通常リーディング' :
           language === 'es' ? 'Lectura Normal' :
           language === 'fr' ? 'Lecture Normale' :
           'Normal Reading'}
        </button>
        <button
          onClick={() => handleLevelChange('deep')}
          className={`px-4 sm:px-6 py-2 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 ${readingLevel === 'deep' ? 'bg-white shadow text-purple-800' : 'text-purple-700/80 hover:bg-white/50'}`}
        >
          {language === 'ja' ? '深い洞察リーディング' :
           language === 'es' ? 'Lectura Profunda' :
           language === 'fr' ? 'Lecture Profonde' :
           'Deep Insight Reading'}
        </button>
      </div>
      
      <p className="text-center text-lg text-amber-800/80 mb-6 h-8 transition-opacity duration-300">
        {getInstructionText()}
      </p>

      {readingMode === 'three' && selectedCards.length === 3 && (
        <div className="text-center mb-6 animate-fadeIn">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105 animate-pulse-draw"
          >
            {language === 'ja' ? '結果を見る' :
             language === 'es' ? 'Ver Resultados' :
             language === 'fr' ? 'Voir les Résultats' :
             'View Results'}
          </button>
        </div>
      )}


      <main>
        <div className="container mx-auto">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-11 gap-3 sm:gap-4 justify-center">
            {cards.map((card, index) => (
              <div
                key={card.id}
                className={
                  isAnimating
                    ? 'animate-shuffle-out'
                    : 'animate-shuffle-in'
                }
                style={
                  (isAnimating
                    ? { ...randomStyles[index], animationDelay: `${Math.random() * 100}ms` }
                    : { animationDelay: `${index * 20}ms` }) as React.CSSProperties
                }
              >
                <OracleCard
                  onClick={() => handleCardSelect(card)}
                  isSelected={!!selectedCards.find(c => c.id === card.id)}
                />
              </div>
            ))}
          </div>
        </div>
      </main>

      <Suspense fallback={<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div></div>}>
        <MessageModal cards={selectedCards} isOpen={isModalOpen} onClose={handleReset} readingLevel={readingLevel} language={language} t={t} onSave={handleSaveReading} />
      </Suspense>
      <Suspense fallback={null}>
        <JournalModal readings={readings} isOpen={isJournalOpen} onClose={() => setIsJournalOpen(false)} onClear={handleClearHistory} />
      </Suspense>
      <Suspense fallback={null}>
        <DisclaimerModal isOpen={isDisclaimerOpen} onClose={() => setIsDisclaimerOpen(false)} />
      </Suspense>
      <Suspense fallback={null}>
        <ManualModal isOpen={isManualOpen} onClose={() => setIsManualOpen(false)} />
      </Suspense>


      <footer className="text-center mt-12 text-amber-800/80 text-sm">
        <p>
          {language === 'ja' ? '日々の神聖な繋がりのひとときを。' :
           language === 'es' ? 'Momentos de conexión sagrada en tu día a día.' :
           language === 'fr' ? 'Des moments de connexion sacrée dans votre quotidien.' :
           'Sacred moments of connection in your daily life.'}
        </p>
        <button
          onClick={() => setIsDisclaimerOpen(true)}
          className="mt-2 text-xs text-stone-500 underline hover:text-amber-900 transition-colors"
        >
          {t.disclaimer}
        </button>
      </footer>
       <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 1s ease-in-out; }

        @keyframes pulse-draw {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(217, 119, 6, 0.5);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 0 12px rgba(217, 119, 6, 0);
          }
        }
        .animate-pulse-draw {
          animation: pulse-draw 2.5s infinite;
        }

        @keyframes shuffle-out {
          from {
            transform: translate(0, 0) rotate(0) scale(1);
            opacity: 1;
          }
          to {
            transform: translate(var(--translateX), var(--translateY)) rotate(var(--rotate-end)) scale(0);
            opacity: 0;
          }
        }
        .animate-shuffle-out {
          animation: shuffle-out 1s cubic-bezier(0.55, 0.055, 0.675, 0.19) forwards;
        }

        @keyframes shuffle-in {
          from {
            transform: translateY(30px) scale(0.8);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        .animate-shuffle-in {
          animation: shuffle-in 0.5s ease-out backwards;
        }
      `}</style>
    </div>
    </ErrorBoundary>
  );
};

export default App;