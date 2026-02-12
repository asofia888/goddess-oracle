import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ManualModal from '../../components/ManualModal';

describe('ManualModal', () => {
  it('should not render when isOpen is false', () => {
    render(<ManualModal isOpen={false} onClose={() => {}} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(<ManualModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should have correct ARIA attributes', () => {
    render(<ManualModal isOpen={true} onClose={() => {}} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'manual-modal-title');
  });

  it('should render the title with correct id', () => {
    render(<ManualModal isOpen={true} onClose={() => {}} />);
    const title = screen.getByText('ご利用マニュアル');
    expect(title).toHaveAttribute('id', 'manual-modal-title');
  });

  it('should render all manual section headings', () => {
    render(<ManualModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('1. リーディングモードを選択する')).toBeInTheDocument();
    expect(screen.getByText('2. カードを選ぶ')).toBeInTheDocument();
    expect(screen.getByText('3. メッセージを受け取る')).toBeInTheDocument();
    expect(screen.getByText('4. リーディング履歴を確認する')).toBeInTheDocument();
    expect(screen.getByText('ご注意')).toBeInTheDocument();
  });

  it('should mention single and three card reading modes', () => {
    render(<ManualModal isOpen={true} onClose={() => {}} />);
    // Use getAllByText since these appear in multiple places (heading + list)
    expect(screen.getAllByText(/1枚引き/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/3枚引き/).length).toBeGreaterThan(0);
  });

  it('should call onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<ManualModal isOpen={true} onClose={handleClose} />);
    fireEvent.click(screen.getByLabelText('閉じる'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Escape is pressed', () => {
    const handleClose = vi.fn();
    render(<ManualModal isOpen={true} onClose={handleClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when backdrop is clicked', () => {
    const handleClose = vi.fn();
    render(<ManualModal isOpen={true} onClose={handleClose} />);
    fireEvent.click(screen.getByRole('dialog'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
