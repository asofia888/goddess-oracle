import React from 'react';
import type { APIError } from '../../utils/errorHandling';
import { getErrorMessage } from '../../utils/errorHandling';
import type { Language } from '../../utils/i18n';

interface ErrorMessageProps {
  error: APIError;
  language: Language;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  language,
  onRetry,
  onDismiss,
  className = ''
}) => {
  const errorMessage = getErrorMessage(error, language);

  const getRetryButtonText = (language: Language) => {
    const texts = {
      ja: '再試行',
      en: 'Retry',
      es: 'Reintentar',
      fr: 'Réessayer'
    };
    return texts[language];
  };

  const getDismissButtonText = (language: Language) => {
    const texts = {
      ja: '閉じる',
      en: 'Dismiss',
      es: 'Cerrar',
      fr: 'Fermer'
    };
    return texts[language];
  };

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-red-700">
            {errorMessage}
          </p>
          {(onRetry || onDismiss) && (
            <div className="mt-3 flex gap-2">
              {onRetry && error.retryable && (
                <button
                  onClick={onRetry}
                  className="bg-red-100 hover:bg-red-200 text-red-800 text-xs font-medium py-1 px-3 rounded-md transition-colors"
                >
                  {getRetryButtonText(language)}
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium py-1 px-3 rounded-md transition-colors"
                >
                  {getDismissButtonText(language)}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;