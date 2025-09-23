
import React from 'react';
import type { SavedReading } from '../types';
import Modal from './shared/Modal';

// Helper function to validate reading data integrity
const validateReading = (reading: SavedReading): boolean => {
  if (!reading || !reading.cards || reading.cards.length === 0) {
    return false;
  }

  // Check if generatedMessages array matches cards length
  if (!reading.generatedMessages || reading.generatedMessages.length !== reading.cards.length) {
    return false;
  }

  // Basic data integrity checks
  return !!(reading.id && reading.date && reading.mode);
};

// Helper function to get safe message
const getSafeMessage = (reading: SavedReading, index: number): string => {
  const generatedMessage = reading.generatedMessages?.[index];
  const fallbackMessage = reading.cards?.[index]?.message;

  return generatedMessage || fallbackMessage || 'メッセージが見つかりません';
};

// Helper function to get safe card
const getSafeCard = (reading: SavedReading, index: number) => {
  return reading.cards?.[index] || {
    id: 0,
    name: '不明なカード',
    description: '',
    message: 'カード情報が見つかりません'
  };
};

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  readings: SavedReading[];
  onClear: () => void;
}

const JournalModal: React.FC<JournalModalProps> = ({ isOpen, onClose, readings, onClear }) => {
  if (!isOpen) {
    return null;
  }

  const validReadings = readings.filter(validateReading);
  const corruptedCount = readings.length - validReadings.length;

  const handleClearClick = () => {
    if (window.confirm('本当にすべての履歴を削除しますか？この操作は元に戻せません。')) {
      onClear();
    }
  };

  const handleCleanupClick = () => {
    if (corruptedCount > 0 && window.confirm(`${corruptedCount}件の破損したデータを削除しますか？`)) {
      // This would require a new prop to handle cleanup, for now just show message
      alert('クリーンアップ機能は次のアップデートで実装予定です。');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="2xl" className="flex flex-col">
      <header className="p-4 sm:p-6 border-b border-amber-200/50 text-center relative">
        <h2 className="text-2xl sm:text-3xl font-bold text-orange-800 tracking-wide">リーディング履歴</h2>
        <button onClick={onClose} className="absolute top-3 right-3 p-2 text-amber-700/80 hover:bg-amber-200/50 rounded-full" aria-label="閉じる">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      <div className="p-4 sm:p-6 overflow-y-auto flex-grow">
        {readings.length === 0 ? (
          <p className="text-center text-stone-600 py-8">リーディングの履歴はまだありません。</p>
        ) : (
          <div className="space-y-4">
            {readings.filter(validateReading).map((reading) => {
              const isValidReading = validateReading(reading);
              if (!isValidReading) {
                console.warn('Invalid reading found:', reading.id);
                return null;
              }

              return (
                <details key={reading.id} className="group bg-white/50 rounded-lg border border-amber-200/50 overflow-hidden">
                  <summary className="p-4 flex justify-between items-center cursor-pointer hover:bg-amber-50/50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-amber-900">
                          {reading.cards.map(c => c?.name || '不明なカード').join(', ')}
                        </p>
                        {reading.readingLevel === 'deep' && (
                          <span className="text-xs font-semibold text-purple-800 bg-purple-200/80 px-2 py-0.5 rounded-full">深い洞察</span>
                        )}
                        {reading.generatedMessages.some(msg => !msg) && (
                          <span className="text-xs font-semibold text-orange-600 bg-orange-200/80 px-2 py-0.5 rounded-full">⚠</span>
                        )}
                      </div>
                      <p className="text-sm text-stone-500 mt-1">{reading.date}</p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-700 transition-transform transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="p-4 border-t border-amber-200/50 bg-amber-50/20">
                    {reading.mode === 'single' && (
                        <div className="space-y-4">
                             {reading.generatedImageUrl && (
                                <img
                                  src={reading.generatedImageUrl}
                                  alt={getSafeCard(reading, 0).name || ''}
                                  className="rounded-lg max-w-xs mx-auto shadow-md"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                            )}
                            <p className="whitespace-pre-wrap text-stone-700 leading-relaxed">
                              {getSafeMessage(reading, 0)}
                            </p>
                        </div>
                    )}
                    {reading.mode === 'three' && (
                        <div className="space-y-6">
                            {[0, 1, 2].map((index) => {
                                const card = getSafeCard(reading, index);
                                const message = getSafeMessage(reading, index);
                                const hasGeneratedMessage = reading.generatedMessages[index];

                                return (
                                    <div key={index}>
                                        <h3 className="font-bold text-amber-800 text-lg mb-1 flex items-center gap-2">
                                          {['過去', '現在', '未来'][index]} - {card.name}
                                          {!hasGeneratedMessage && (
                                            <span className="text-xs text-orange-600" title="元のメッセージを表示中">⚠</span>
                                          )}
                                        </h3>
                                        <p className="whitespace-pre-wrap text-stone-700 leading-relaxed text-sm">
                                          {message}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                  </div>
                </details>
              );
            })}
            {readings.length > readings.filter(validateReading).length && (
              <div className="text-center p-4 bg-yellow-100/50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-700 text-sm">
                  {readings.length - readings.filter(validateReading).length}件の破損したデータが非表示になっています
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      {readings.length > 0 && (
        <footer className="p-4 sm:p-6 border-t border-amber-200/50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-stone-600">
              合計: {readings.length}件
              {validReadings.length !== readings.length && (
                <span className="text-orange-600 ml-2">
                  (有効: {validReadings.length}件, 破損: {corruptedCount}件)
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {corruptedCount > 0 && (
                <button
                  onClick={handleCleanupClick}
                  className="px-3 py-1 text-xs font-semibold text-orange-600 bg-orange-100 hover:bg-orange-200 rounded-lg transition-colors"
                  aria-label="破損したデータをクリーンアップ"
                >
                  クリーンアップ
                </button>
              )}
              <button
                onClick={handleClearClick}
                className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                aria-label="リーディング履歴をすべて削除する"
              >
                履歴をすべて削除
              </button>
            </div>
          </div>
        </footer>
      )}
    </Modal>
  );
};

export default JournalModal;