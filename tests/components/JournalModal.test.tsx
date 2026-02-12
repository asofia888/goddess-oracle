import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import JournalModal from '../../components/JournalModal';
import type { SavedReading } from '../../types';
import { mockCard, mockThreeCards } from '../helpers/mockData';

// Create valid readings that pass validateReading
const validSingleReading: SavedReading = {
  id: 'reading-1',
  date: '2025-01-01 12:00',
  mode: 'single',
  cards: [mockCard],
  generatedMessages: ['A beautiful oracle message for you.'],
  generatedImageUrl: '/images/aphrodite/1.webp',
  readingLevel: 'normal',
};

const validThreeReading: SavedReading = {
  id: 'reading-2',
  date: '2025-01-02 14:00',
  mode: 'three',
  cards: mockThreeCards,
  generatedMessages: ['Past message', 'Present message', 'Future message'],
  generatedImageUrl: null,
  readingLevel: 'deep',
};

describe('JournalModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    readings: [] as SavedReading[],
    onClear: vi.fn(),
  };

  it('should not render when isOpen is false', () => {
    render(<JournalModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render with correct ARIA attributes', () => {
    render(<JournalModal {...defaultProps} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'journal-modal-title');
  });

  it('should render the title', () => {
    render(<JournalModal {...defaultProps} />);
    const title = screen.getByText('リーディング履歴');
    expect(title).toHaveAttribute('id', 'journal-modal-title');
  });

  it('should show empty state message when no readings', () => {
    render(<JournalModal {...defaultProps} readings={[]} />);
    expect(screen.getByText(/リーディングの履歴はまだありません/)).toBeInTheDocument();
  });

  it('should render single card readings', () => {
    render(<JournalModal {...defaultProps} readings={[validSingleReading]} />);
    expect(screen.getByText('Aphrodite')).toBeInTheDocument();
    expect(screen.getByText(validSingleReading.date)).toBeInTheDocument();
  });

  it('should render three card readings with all card names', () => {
    render(<JournalModal {...defaultProps} readings={[validThreeReading]} />);
    expect(screen.getByText('Aphrodite, Artemis, Athena')).toBeInTheDocument();
  });

  it('should show deep insight badge for deep readings', () => {
    render(<JournalModal {...defaultProps} readings={[validThreeReading]} />);
    expect(screen.getByText('深い洞察')).toBeInTheDocument();
  });

  it('should show reading count in footer', () => {
    render(<JournalModal {...defaultProps} readings={[validSingleReading]} />);
    expect(screen.getByText(/合計: 1件/)).toBeInTheDocument();
  });

  it('should expand reading details when clicked', () => {
    render(<JournalModal {...defaultProps} readings={[validSingleReading]} />);
    const summary = screen.getByText('Aphrodite').closest('summary');
    fireEvent.click(summary!);
    expect(screen.getByText('A beautiful oracle message for you.')).toBeInTheDocument();
  });

  it('should show three-card reading details with time labels', () => {
    render(<JournalModal {...defaultProps} readings={[validThreeReading]} />);
    const summary = screen.getByText('Aphrodite, Artemis, Athena').closest('summary');
    fireEvent.click(summary!);
    expect(screen.getByText(/過去 - Aphrodite/)).toBeInTheDocument();
    expect(screen.getByText(/現在 - Artemis/)).toBeInTheDocument();
    expect(screen.getByText(/未来 - Athena/)).toBeInTheDocument();
  });

  it('should ask for confirmation before clearing history', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const handleClear = vi.fn();
    render(<JournalModal {...defaultProps} readings={[validSingleReading]} onClear={handleClear} />);
    fireEvent.click(screen.getByText('履歴をすべて削除'));
    expect(confirmSpy).toHaveBeenCalled();
    expect(handleClear).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it('should call onClear when clear is confirmed', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const handleClear = vi.fn();
    render(<JournalModal {...defaultProps} readings={[validSingleReading]} onClear={handleClear} />);
    fireEvent.click(screen.getByText('履歴をすべて削除'));
    expect(handleClear).toHaveBeenCalledTimes(1);
    vi.restoreAllMocks();
  });

  it('should call onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<JournalModal {...defaultProps} onClose={handleClose} />);
    fireEvent.click(screen.getByLabelText('閉じる'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
