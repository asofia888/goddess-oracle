
import React, { useState, useEffect, useCallback } from 'react';
import { GODDESS_CARDS } from './constants';
import type { GoddessCardData, SavedReading, ReadingLevel } from './types';
import OracleCard from './components/OracleCard';
import MessageModal from './components/MessageModal';
import JournalModal from './components/JournalModal';
import DisclaimerModal from './components/DisclaimerModal';
import ManualModal from './components/ManualModal';
import CardDetailView from './components/CardDetailView';
import { getReadings, clearReadings } from './utils/storage';
import { detectLanguage, getTranslation, type Language } from './utils/i18n';

// Fisher-Yates shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

type ReadingMode = 'single' | 'three';

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
  const [selectedCardForDetail, setSelectedCardForDetail] = useState<GoddessCardData | null>(null);
  const [isCardDetailOpen, setIsCardDetailOpen] = useState(false);


  const shuffleAndSetCards = useCallback(() => {
    setCards(shuffleArray(GODDESS_CARDS));
  }, []);

  useEffect(() => {
    const detectedLang = detectLanguage();
    setLanguage(detectedLang);
    setT(getTranslation(detectedLang));
    setCards(shuffleArray(GODDESS_CARDS));
    setReadings(getReadings());
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'ja' ? 'en' : 'ja';
    setLanguage(newLang);
    setT(getTranslation(newLang));
  };
  
  const performAnimatedShuffle = useCallback(() => {
    if (isAnimating) return;

    // 拡散アニメーション用のスタイルを生成
    // FIX: Cast the style object to React.CSSProperties to allow for custom CSS properties.
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
    setTimeout(() => {
      shuffleAndSetCards();
      setIsAnimating(false);
    }, 1000); // CSSアニメーションの時間に合わせる
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

  const handleCardDetailView = (card: GoddessCardData) => {
    if (isAnimating || isModalOpen) return;

    setSelectedCardForDetail(card);
    setIsCardDetailOpen(true);
  };

  const handleCloseCardDetail = () => {
    setIsCardDetailOpen(false);
    setSelectedCardForDetail(null);
  };

  const handleReset = () => {
    setIsModalOpen(false);
    setReadings(getReadings()); // Refresh readings from storage
    setTimeout(() => {
      performAnimatedShuffle();
    }, 300); // Wait for modal animation
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
        return language === 'ja'
          ? 'カードを1枚選んで、導きのメッセージを受け取りましょう。'
          : 'Select one card to receive your guidance message.'
    }
    return language === 'ja'
      ? `過去、現在、未来を示すカードを3枚選んでください。(${selectedCards.length}/3)`
      : `Please select 3 cards representing past, present, and future. (${selectedCards.length}/3)`
  }

  const handleClearHistory = () => {
    clearReadings();
    setReadings([]);
  };

  return (
    <div className="min-h-screen bg-violet-50 text-slate-800 p-4 sm:p-8 overflow-hidden">
      <header className="text-center mb-4 animate-fadeIn relative">
        <img src="/logo.png" alt="女神のオラクル ロゴ" className="mx-auto mb-4" style={{width: '180px', height: '180px'}} />
        <h1 className="text-4xl sm:text-6xl font-bold text-orange-900/90 tracking-wider">{t.appTitle}</h1>
        <div className="absolute top-0 right-0 h-full flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={toggleLanguage}
            className="p-2 text-sm bg-white/80 backdrop-blur-sm rounded-lg border border-orange-200 hover:bg-orange-50 transition-colors shadow-sm"
            title={language === 'ja' ? 'Switch to English' : '日本語に切り替え'}
          >
            {language === 'ja' ? 'EN' : 'JA'}
          </button>
          <button
            onClick={() => setIsManualOpen(true)}
            className="p-2 rounded-full text-amber-700/80 hover:bg-amber-200/50 transition-colors"
            aria-label={t.manual}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button
            onClick={() => setIsJournalOpen(true)}
            className="p-2 rounded-full text-amber-700/80 hover:bg-amber-200/50 transition-colors"
            aria-label="リーディング履歴を開く"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </button>
        </div>
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
          {language === 'ja' ? '通常リーディング' : 'Normal Reading'}
        </button>
        <button
          onClick={() => handleLevelChange('deep')}
          className={`px-4 sm:px-6 py-2 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 ${readingLevel === 'deep' ? 'bg-white shadow text-purple-800' : 'text-purple-700/80 hover:bg-white/50'}`}
        >
          {language === 'ja' ? '深い洞察リーディング' : 'Deep Insight Reading'}
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
            {language === 'ja' ? '結果を見る' : 'View Results'}
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
                  onDoubleClick={() => handleCardDetailView(card)}
                  isSelected={!!selectedCards.find(c => c.id === card.id)}
                />
              </div>
            ))}
          </div>
        </div>
      </main>

      <MessageModal cards={selectedCards} isOpen={isModalOpen} onClose={handleReset} readingLevel={readingLevel} language={language} t={t} />
      <JournalModal readings={readings} isOpen={isJournalOpen} onClose={() => setIsJournalOpen(false)} onClear={handleClearHistory} />
      <DisclaimerModal isOpen={isDisclaimerOpen} onClose={() => setIsDisclaimerOpen(false)} />
      <ManualModal isOpen={isManualOpen} onClose={() => setIsManualOpen(false)} />
      {selectedCardForDetail && (
        <CardDetailView
          card={selectedCardForDetail}
          isOpen={isCardDetailOpen}
          onClose={handleCloseCardDetail}
        />
      )}


      <footer className="text-center mt-12 text-amber-800/80 text-sm">
        <p>日々の神聖な繋がりのひとときを。</p>
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
  );
};

export default App;