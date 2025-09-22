import React from 'react';
import type { GoddessCardData } from '../types';

interface CardDetailViewProps {
  card: GoddessCardData;
  isOpen: boolean;
  onClose: () => void;
}

const CardDetailView: React.FC<CardDetailViewProps> = ({ card, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out animate-fadeInModal"
      onClick={onClose}
    >
      <div
        className="bg-violet-50 border border-amber-200/50 rounded-2xl shadow-2xl shadow-amber-500/20 w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 animate-zoomIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-orange-800 tracking-wide mb-2">
            {card.name}
          </h2>
          <p className="text-lg text-amber-700 italic mb-1">
            {card.origin}の女神
          </p>
          <p className="text-md text-stone-600 mb-6">
            {card.description}
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-200/50">
            <h3 className="text-xl font-semibold text-orange-800 mb-2">メインテーマ</h3>
            <p className="text-lg text-stone-700 font-medium">{card.theme}</p>
          </div>

          {card.secondaryThemes && card.secondaryThemes.length > 0 && (
            <div className="bg-purple-50/50 p-4 rounded-lg border border-purple-200/50">
              <h3 className="text-xl font-semibold text-purple-800 mb-2">関連テーマ</h3>
              <div className="flex flex-wrap gap-2">
                {card.secondaryThemes.map((theme, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-200/50">
            <h3 className="text-xl font-semibold text-blue-800 mb-2">エレメント</h3>
            <p className="text-lg text-stone-700 capitalize">{card.element}</p>
          </div>

          <div className="bg-green-50/50 p-4 rounded-lg border border-green-200/50">
            <h3 className="text-xl font-semibold text-green-800 mb-2">キーワード</h3>
            <div className="flex flex-wrap gap-2">
              {card.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-rose-50/50 p-4 rounded-lg border border-rose-200/50">
            <h3 className="text-xl font-semibold text-rose-800 mb-2">シンボル</h3>
            <div className="flex flex-wrap gap-2">
              {card.symbols.map((symbol, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm"
                >
                  {symbol}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-indigo-50/50 p-4 rounded-lg border border-indigo-200/50">
            <h3 className="text-xl font-semibold text-indigo-800 mb-2">カラー</h3>
            <div className="flex flex-wrap gap-2">
              {card.colors.map((color, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                >
                  {color}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-yellow-50/50 p-4 rounded-lg border border-yellow-200/50">
            <h3 className="text-xl font-semibold text-yellow-800 mb-2">アファメーション</h3>
            <p className="text-base text-stone-700 italic leading-relaxed">
              "{card.affirmation}"
            </p>
          </div>

          <div className="bg-teal-50/50 p-4 rounded-lg border border-teal-200/50">
            <h3 className="text-xl font-semibold text-teal-800 mb-2">日常のガイダンス</h3>
            <ul className="space-y-2">
              {card.dailyGuidance.map((guidance, index) => (
                <li key={index} className="text-base text-stone-700 flex items-start">
                  <span className="text-teal-600 mr-2">•</span>
                  {guidance}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={onClose}
            className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105"
          >
            閉じる
          </button>
        </div>

        <style>{`
          @keyframes fadeInModal {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes zoomIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fadeInModal { animation: fadeInModal 0.3s ease-in-out; }
          .animate-zoomIn { animation: zoomIn 0.3s ease-out; }
        `}</style>
      </div>
    </div>
  );
};

export default CardDetailView;