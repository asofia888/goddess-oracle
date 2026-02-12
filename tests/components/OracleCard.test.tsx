import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import OracleCard from '../../components/OracleCard';

describe('OracleCard', () => {
  it('should render a card with button role', () => {
    render(<OracleCard onClick={() => {}} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<OracleCard onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should call onClick when Enter key is pressed', () => {
    const handleClick = vi.fn();
    render(<OracleCard onClick={handleClick} />);
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should call onClick when Space key is pressed', () => {
    const handleClick = vi.fn();
    render(<OracleCard onClick={handleClick} />);
    fireEvent.keyDown(screen.getByRole('button'), { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not call onClick for other keys', () => {
    const handleClick = vi.fn();
    render(<OracleCard onClick={handleClick} />);
    fireEvent.keyDown(screen.getByRole('button'), { key: 'a' });
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should have tabIndex 0 for keyboard focus', () => {
    render(<OracleCard onClick={() => {}} />);
    expect(screen.getByRole('button')).toHaveAttribute('tabindex', '0');
  });

  it('should show aria-pressed=false when not selected', () => {
    render(<OracleCard onClick={() => {}} isSelected={false} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
  });

  it('should show aria-pressed=true when selected', () => {
    render(<OracleCard onClick={() => {}} isSelected={true} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('should apply custom aria-label via cardLabel prop', () => {
    render(<OracleCard onClick={() => {}} cardLabel="Card number 5" />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Card number 5');
  });

  it('should have decorative SVG hidden from screen readers', () => {
    render(<OracleCard onClick={() => {}} />);
    const svg = screen.getByRole('button').querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });
});
