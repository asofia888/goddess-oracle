import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ErrorMessage from '../../components/shared/ErrorMessage';
import type { APIError } from '../../utils/errorHandling';

const retryableError: APIError = {
  code: 'NETWORK_ERROR',
  message: 'Network error',
  retryable: true,
  timestamp: Date.now(),
};

const nonRetryableError: APIError = {
  code: 'API_QUOTA_EXCEEDED',
  message: 'Quota exceeded',
  retryable: false,
  timestamp: Date.now(),
};

describe('ErrorMessage', () => {
  it('should render error message in English', () => {
    render(<ErrorMessage error={retryableError} language="en" />);
    expect(screen.getByText(/check your internet/i)).toBeInTheDocument();
  });

  it('should render error message in Japanese', () => {
    render(<ErrorMessage error={retryableError} language="ja" />);
    expect(screen.getByText(/インターネット接続/)).toBeInTheDocument();
  });

  it('should show retry button for retryable errors', () => {
    const handleRetry = vi.fn();
    render(<ErrorMessage error={retryableError} language="en" onRetry={handleRetry} />);
    const retryButton = screen.getByText('Retry');
    expect(retryButton).toBeInTheDocument();
    fireEvent.click(retryButton);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('should not show retry button for non-retryable errors', () => {
    render(<ErrorMessage error={nonRetryableError} language="en" onRetry={() => {}} />);
    expect(screen.queryByText('Retry')).not.toBeInTheDocument();
  });

  it('should show dismiss button when onDismiss is provided', () => {
    const handleDismiss = vi.fn();
    render(<ErrorMessage error={retryableError} language="en" onDismiss={handleDismiss} />);
    const dismissButton = screen.getByText('Dismiss');
    fireEvent.click(dismissButton);
    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });

  it('should show Japanese button text for Japanese language', () => {
    render(<ErrorMessage error={retryableError} language="ja" onRetry={() => {}} onDismiss={() => {}} />);
    expect(screen.getByText('再試行')).toBeInTheDocument();
    expect(screen.getByText('閉じる')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ErrorMessage error={retryableError} language="en" className="text-xs" />
    );
    expect(container.firstChild).toHaveClass('text-xs');
  });
});
