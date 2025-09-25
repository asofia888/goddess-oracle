import React, { Component, ErrorInfo, ReactNode } from 'react';
import type { Language } from '../../utils/i18n';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  language?: Language;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // Log to external service if needed (e.g., Sentry)
    // logErrorToService(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  private getErrorMessages(language: Language = 'ja') {
    const messages = {
      ja: {
        title: 'エラーが発生しました',
        description: '予期しないエラーが発生しました。ページを更新するか、しばらく時間を置いてからお試しください。',
        retryButton: 'もう一度試す',
        refreshButton: 'ページを更新'
      },
      en: {
        title: 'Something went wrong',
        description: 'An unexpected error occurred. Please refresh the page or try again later.',
        retryButton: 'Try Again',
        refreshButton: 'Refresh Page'
      },
      es: {
        title: 'Algo salió mal',
        description: 'Ocurrió un error inesperado. Actualiza la página o inténtalo más tarde.',
        retryButton: 'Intentar de Nuevo',
        refreshButton: 'Actualizar Página'
      },
      fr: {
        title: 'Une erreur s\'est produite',
        description: 'Une erreur inattendue s\'est produite. Actualisez la page ou réessayez plus tard.',
        retryButton: 'Réessayer',
        refreshButton: 'Actualiser la Page'
      }
    };
    return messages[language];
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const messages = this.getErrorMessages(this.props.language);

      return (
        <div className="min-h-screen bg-violet-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <div className="mb-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-8 w-8 text-red-600"
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
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {messages.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {messages.description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                {messages.retryButton}
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                {messages.refreshButton}
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Technical Details
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;