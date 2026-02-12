import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ErrorBoundary from '../../components/shared/ErrorBoundary';

// Component that throws an error for testing
const ThrowingComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <p>Normal content</p>;
};

// Suppress console.error during ErrorBoundary tests
const originalConsoleError = console.error;

describe('ErrorBoundary', () => {
  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <p>Child content</p>
      </ErrorBoundary>
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('should show Japanese error UI when a child throws', () => {
    render(
      <ErrorBoundary language="ja">
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
    expect(screen.getByText('もう一度試す')).toBeInTheDocument();
    expect(screen.getByText('ページを更新')).toBeInTheDocument();
  });

  it('should show English error UI when language is en', () => {
    render(
      <ErrorBoundary language="en">
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Refresh Page')).toBeInTheDocument();
  });

  it('should reset error state when retry button is clicked', () => {
    // Use a stateful wrapper to control throwing
    let shouldThrow = true;
    const DynamicComponent = () => {
      if (shouldThrow) throw new Error('Test error');
      return <p>Normal content</p>;
    };

    render(
      <ErrorBoundary language="en">
        <DynamicComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Stop throwing before clicking retry
    shouldThrow = false;
    fireEvent.click(screen.getByText('Try Again'));

    expect(screen.getByText('Normal content')).toBeInTheDocument();
  });

  it('should render custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<p>Custom error fallback</p>}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Custom error fallback')).toBeInTheDocument();
  });

  it('should call onError callback when error occurs', () => {
    const handleError = vi.fn();
    render(
      <ErrorBoundary onError={handleError}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(handleError).toHaveBeenCalledTimes(1);
    expect(handleError.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(handleError.mock.calls[0][0].message).toBe('Test error');
  });
});
