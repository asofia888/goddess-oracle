import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MessageModal from '../../components/MessageModal';
import { mockCard, mockThreeCards, mockTranslationsEn } from '../helpers/mockData';

// Mock imageSelection module
vi.mock('../../utils/imageSelection', () => ({
  getRandomGoddessImage: vi.fn(() => '/images/aphrodite/1.webp'),
  preloadImage: vi.fn(() => Promise.resolve()),
}));

// Mock storage module
vi.mock('../../utils/storage', () => ({
  saveReading: vi.fn(() => true),
}));

describe('MessageModal', () => {
  const defaultProps = {
    cards: [mockCard],
    isOpen: true,
    onClose: vi.fn(),
    readingLevel: 'normal' as const,
    language: 'en' as const,
    t: mockTranslationsEn,
    onSave: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock successful API response
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ messages: ['A divine message from Aphrodite.'] }),
      })
    ) as unknown as typeof fetch;
  });

  it('should not render content when isOpen is false', () => {
    render(<MessageModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render modal with dialog role when open', () => {
    render(<MessageModal {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should show card name for single card reading', () => {
    render(<MessageModal {...defaultProps} />);
    expect(screen.getByText('Aphrodite')).toBeInTheDocument();
  });

  it('should show card description', () => {
    render(<MessageModal {...defaultProps} />);
    expect(screen.getByText('Greek goddess of love and beauty')).toBeInTheDocument();
  });

  it('should show theme section', () => {
    render(<MessageModal {...defaultProps} />);
    expect(screen.getByText('Love & Beauty')).toBeInTheDocument();
  });

  it('should show affirmation section', () => {
    render(<MessageModal {...defaultProps} />);
    expect(screen.getByText(/"I am worthy of love."/)).toBeInTheDocument();
  });

  it('should show daily guidance section', () => {
    render(<MessageModal {...defaultProps} />);
    expect(screen.getByText('Practice self-care')).toBeInTheDocument();
  });

  it('should show loading state initially', () => {
    render(<MessageModal {...defaultProps} />);
    expect(screen.getByText('Loading message...')).toBeInTheDocument();
  });

  it('should display generated message after API response', async () => {
    render(<MessageModal {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText('A divine message from Aphrodite.')).toBeInTheDocument();
    });
  });

  it('should show save and close buttons', () => {
    render(<MessageModal {...defaultProps} />);
    expect(screen.getByText('Save Reading')).toBeInTheDocument();
    expect(screen.getByText('Close')).toBeInTheDocument();
  });

  it('should have aria-labelledby on single card modal', () => {
    render(<MessageModal {...defaultProps} />);
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby', 'message-modal-title');
  });

  // Three card spread tests
  it('should show three card spread title', () => {
    render(<MessageModal {...defaultProps} cards={mockThreeCards} />);
    expect(screen.getByText('Three Card Spread')).toBeInTheDocument();
  });

  it('should show past, present, future labels for three cards', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ messages: ['Past message', 'Present message', 'Future message'] }),
      })
    ) as unknown as typeof fetch;
    render(<MessageModal {...defaultProps} cards={mockThreeCards} />);
    await waitFor(() => {
      expect(screen.getByText('Past')).toBeInTheDocument();
      expect(screen.getByText('Present')).toBeInTheDocument();
      expect(screen.getByText('Future')).toBeInTheDocument();
    });
  });

  it('should show all three card names', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ messages: ['Past message', 'Present message', 'Future message'] }),
      })
    ) as unknown as typeof fetch;
    render(<MessageModal {...defaultProps} cards={mockThreeCards} />);
    await waitFor(() => {
      expect(screen.getByText('Aphrodite')).toBeInTheDocument();
      expect(screen.getByText('Artemis')).toBeInTheDocument();
      expect(screen.getByText('Athena')).toBeInTheDocument();
    });
  });

  it('should have aria-labelledby on three card modal', () => {
    render(<MessageModal {...defaultProps} cards={mockThreeCards} />);
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby', 'three-card-modal-title');
  });

  it('should show fallback message on API error', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error'))) as unknown as typeof fetch;
    render(<MessageModal {...defaultProps} />);
    // retryWithExponentialBackoff retries 3 times, so we need a longer timeout
    await waitFor(
      () => {
        // Fallback to card's default message
        expect(screen.getByText('Open your heart to love.')).toBeInTheDocument();
      },
      { timeout: 15000 }
    );
  }, 20000);
});
