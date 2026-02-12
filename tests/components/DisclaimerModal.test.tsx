import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DisclaimerModal from '../../components/DisclaimerModal';

describe('DisclaimerModal', () => {
  it('should not render when isOpen is false', () => {
    render(<DisclaimerModal isOpen={false} onClose={() => {}} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(<DisclaimerModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should have correct ARIA attributes', () => {
    render(<DisclaimerModal isOpen={true} onClose={() => {}} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'disclaimer-modal-title');
  });

  it('should render the title with correct id', () => {
    render(<DisclaimerModal isOpen={true} onClose={() => {}} />);
    const title = screen.getByText('免責事項・利用規約');
    expect(title).toHaveAttribute('id', 'disclaimer-modal-title');
  });

  it('should render all disclaimer section headings', () => {
    render(<DisclaimerModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('1. エンターテイメント目的')).toBeInTheDocument();
    expect(screen.getByText('2. 専門的な助言の代替ではありません')).toBeInTheDocument();
    expect(screen.getByText('3. AIによる生成コンテンツについて')).toBeInTheDocument();
    expect(screen.getByText('4. 免責事項')).toBeInTheDocument();
    expect(screen.getByText('5. 本規約への同意')).toBeInTheDocument();
    expect(screen.getByText('6. サービスの変更・中断')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<DisclaimerModal isOpen={true} onClose={handleClose} />);
    fireEvent.click(screen.getByLabelText('閉じる'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when footer close button is clicked', () => {
    const handleClose = vi.fn();
    render(<DisclaimerModal isOpen={true} onClose={handleClose} />);
    const closeButtons = screen.getAllByText('閉じる');
    // Footer button (the button element, not the aria-label one)
    const footerButton = closeButtons.find(el => el.tagName === 'BUTTON' && !el.getAttribute('aria-label'));
    fireEvent.click(footerButton!);
    expect(handleClose).toHaveBeenCalled();
  });

  it('should call onClose when Escape is pressed', () => {
    const handleClose = vi.fn();
    render(<DisclaimerModal isOpen={true} onClose={handleClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when backdrop is clicked', () => {
    const handleClose = vi.fn();
    render(<DisclaimerModal isOpen={true} onClose={handleClose} />);
    fireEvent.click(screen.getByRole('dialog'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
