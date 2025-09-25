import type { Language } from './i18n';

export interface APIError {
  code: string;
  message: string;
  retryable: boolean;
  timestamp: number;
}

export enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_KEY_MISSING = 'API_KEY_MISSING',
  API_RATE_LIMIT = 'API_RATE_LIMIT',
  API_QUOTA_EXCEEDED = 'API_QUOTA_EXCEEDED',
  INVALID_REQUEST = 'INVALID_REQUEST',
  SERVER_ERROR = 'SERVER_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export const ERROR_MESSAGES = {
  ja: {
    [ErrorCode.NETWORK_ERROR]: 'インターネット接続を確認してください',
    [ErrorCode.API_KEY_MISSING]: '設定エラーが発生しました。しばらくお待ちください',
    [ErrorCode.API_RATE_LIMIT]: 'アクセスが集中しています。少し時間を置いてからお試しください',
    [ErrorCode.API_QUOTA_EXCEEDED]: '本日の利用上限に達しました。明日再度お試しください',
    [ErrorCode.INVALID_REQUEST]: 'リクエストに問題があります。ページを更新してお試しください',
    [ErrorCode.SERVER_ERROR]: 'サーバーに一時的な問題が発生しています',
    [ErrorCode.TIMEOUT_ERROR]: 'タイムアウトしました。もう一度お試しください',
    [ErrorCode.PARSE_ERROR]: '応答の解析に失敗しました',
    [ErrorCode.UNKNOWN_ERROR]: '予期しないエラーが発生しました'
  },
  en: {
    [ErrorCode.NETWORK_ERROR]: 'Please check your internet connection',
    [ErrorCode.API_KEY_MISSING]: 'Configuration error occurred. Please wait a moment',
    [ErrorCode.API_RATE_LIMIT]: 'Too many requests. Please try again in a moment',
    [ErrorCode.API_QUOTA_EXCEEDED]: 'Daily usage limit reached. Please try again tomorrow',
    [ErrorCode.INVALID_REQUEST]: 'Request error. Please refresh the page and try again',
    [ErrorCode.SERVER_ERROR]: 'Server is temporarily unavailable',
    [ErrorCode.TIMEOUT_ERROR]: 'Request timed out. Please try again',
    [ErrorCode.PARSE_ERROR]: 'Failed to parse response',
    [ErrorCode.UNKNOWN_ERROR]: 'An unexpected error occurred'
  },
  es: {
    [ErrorCode.NETWORK_ERROR]: 'Por favor verifica tu conexión a internet',
    [ErrorCode.API_KEY_MISSING]: 'Error de configuración. Por favor espera un momento',
    [ErrorCode.API_RATE_LIMIT]: 'Demasiadas solicitudes. Intenta de nuevo en un momento',
    [ErrorCode.API_QUOTA_EXCEEDED]: 'Límite diario alcanzado. Intenta mañana',
    [ErrorCode.INVALID_REQUEST]: 'Error en la solicitud. Actualiza la página e intenta de nuevo',
    [ErrorCode.SERVER_ERROR]: 'El servidor no está disponible temporalmente',
    [ErrorCode.TIMEOUT_ERROR]: 'Tiempo de espera agotado. Intenta de nuevo',
    [ErrorCode.PARSE_ERROR]: 'Error al procesar la respuesta',
    [ErrorCode.UNKNOWN_ERROR]: 'Ocurrió un error inesperado'
  },
  fr: {
    [ErrorCode.NETWORK_ERROR]: 'Veuillez vérifier votre connexion internet',
    [ErrorCode.API_KEY_MISSING]: 'Erreur de configuration. Veuillez patienter',
    [ErrorCode.API_RATE_LIMIT]: 'Trop de requêtes. Réessayez dans un moment',
    [ErrorCode.API_QUOTA_EXCEEDED]: 'Limite quotidienne atteinte. Réessayez demain',
    [ErrorCode.INVALID_REQUEST]: 'Erreur de requête. Actualisez la page et réessayez',
    [ErrorCode.SERVER_ERROR]: 'Le serveur est temporairement indisponible',
    [ErrorCode.TIMEOUT_ERROR]: 'Délai d\'attente dépassé. Réessayez',
    [ErrorCode.PARSE_ERROR]: 'Échec de l\'analyse de la réponse',
    [ErrorCode.UNKNOWN_ERROR]: 'Une erreur inattendue s\'est produite'
  }
};

export function createAPIError(
  code: ErrorCode,
  originalError?: Error,
  retryable: boolean = true
): APIError {
  return {
    code,
    message: originalError?.message || 'Unknown error',
    retryable,
    timestamp: Date.now()
  };
}

export function getErrorMessage(error: APIError, language: Language): string {
  return ERROR_MESSAGES[language][error.code] || ERROR_MESSAGES[language][ErrorCode.UNKNOWN_ERROR];
}

export function parseAPIError(error: any): APIError {
  if (error?.code === 'ENOTFOUND' || error?.code === 'ENETUNREACH') {
    return createAPIError(ErrorCode.NETWORK_ERROR, error);
  }

  if (error?.status === 401 || error?.message?.includes('API key')) {
    return createAPIError(ErrorCode.API_KEY_MISSING, error, false);
  }

  if (error?.status === 429 || error?.message?.includes('rate limit')) {
    return createAPIError(ErrorCode.API_RATE_LIMIT, error);
  }

  if (error?.status === 403 || error?.message?.includes('quota')) {
    return createAPIError(ErrorCode.API_QUOTA_EXCEEDED, error, false);
  }

  if (error?.status === 400) {
    return createAPIError(ErrorCode.INVALID_REQUEST, error, false);
  }

  if (error?.status >= 500 && error?.status < 600) {
    return createAPIError(ErrorCode.SERVER_ERROR, error);
  }

  if (error?.name === 'TimeoutError' || error?.code === 'TIMEOUT') {
    return createAPIError(ErrorCode.TIMEOUT_ERROR, error);
  }

  if (error instanceof SyntaxError || error?.message?.includes('parse')) {
    return createAPIError(ErrorCode.PARSE_ERROR, error, false);
  }

  return createAPIError(ErrorCode.UNKNOWN_ERROR, error);
}

export async function retryWithExponentialBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const apiError = parseAPIError(error);
      lastError = apiError;

      // Don't retry for non-retryable errors
      if (!apiError.retryable || attempt === maxRetries) {
        throw apiError;
      }

      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}