import React from 'react';
import type { ReadingQuota } from '../types/subscription';
import type { Language } from '../utils/i18n';

interface QuotaDisplayProps {
  quota: ReadingQuota;
  language: Language;
  onUpgrade?: () => void;
}

const QuotaDisplay: React.FC<QuotaDisplayProps> = ({
  quota,
  language,
  onUpgrade
}) => {
  const t = {
    ja: {
      readingsLeft: '残りリーディング回数',
      unlimited: '無制限',
      resetsIn: 'リセットまで',
      upgrade: 'アップグレード',
      of: '/',
      times: '回'
    },
    en: {
      readingsLeft: 'Readings Left',
      unlimited: 'Unlimited',
      resetsIn: 'Resets in',
      upgrade: 'Upgrade',
      of: '/',
      times: ''
    }
  };

  const text = t[language];

  // Calculate time until reset
  const getTimeUntilReset = (): string => {
    if (!quota.resetTime) return '';

    const now = new Date();
    const reset = quota.resetTime;
    const diffMs = reset.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (language === 'ja') {
      return `${diffHours}時間${diffMinutes}分`;
    } else {
      return `${diffHours}h ${diffMinutes}m`;
    }
  };

  if (quota.available === 'unlimited') {
    return (
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg
              className="w-6 h-6 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-lg font-semibold text-amber-900">
              {text.unlimited}
            </span>
          </div>
          <div className="text-sm text-amber-700">
            {text.readingsLeft}
          </div>
        </div>
      </div>
    );
  }

  const percentage = quota.limit !== 'unlimited'
    ? (quota.used / (quota.limit as number)) * 100
    : 0;

  const isLowQuota = quota.available <= 1;
  const isWarning = percentage >= 66;

  return (
    <div
      className={`border-2 rounded-lg p-4 shadow-sm transition-all ${
        isLowQuota
          ? 'bg-red-50 border-red-300'
          : isWarning
          ? 'bg-yellow-50 border-yellow-300'
          : 'bg-green-50 border-green-300'
      }`}
    >
      {/* Quota Info */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm text-gray-600 mb-1">
            {text.readingsLeft}
          </div>
          <div className="text-2xl font-bold">
            <span
              className={
                isLowQuota
                  ? 'text-red-700'
                  : isWarning
                  ? 'text-yellow-700'
                  : 'text-green-700'
              }
            >
              {quota.available}
            </span>
            <span className="text-gray-500 text-lg">
              {text.of}{quota.limit}{text.times}
            </span>
          </div>
        </div>

        {/* Reset Time */}
        {quota.resetTime && (
          <div className="text-right">
            <div className="text-xs text-gray-600 mb-1">
              {text.resetsIn}
            </div>
            <div className="text-sm font-semibold text-gray-700">
              {getTimeUntilReset()}
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isLowQuota
              ? 'bg-red-500'
              : isWarning
              ? 'bg-yellow-500'
              : 'bg-green-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Upgrade Button */}
      {isLowQuota && onUpgrade && (
        <button
          onClick={onUpgrade}
          className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <span>{text.upgrade}</span>
        </button>
      )}
    </div>
  );
};

export default QuotaDisplay;
