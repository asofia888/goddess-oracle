import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render with the provided text', () => {
    render(<LoadingSpinner text="Loading message..." />);
    expect(screen.getByText('Loading message...')).toBeInTheDocument();
  });

  it('should render Japanese text', () => {
    render(<LoadingSpinner text="読み込み中..." />);
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('should render a spinner SVG', () => {
    const { container } = render(<LoadingSpinner text="Loading" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should apply small size class', () => {
    const { container } = render(<LoadingSpinner text="Loading" size="sm" />);
    const svg = container.querySelector('svg');
    const svgClass = svg?.getAttribute('class') || '';
    expect(svgClass).toContain('h-3');
    expect(svgClass).toContain('w-3');
  });

  it('should apply medium size class by default', () => {
    const { container } = render(<LoadingSpinner text="Loading" />);
    const svg = container.querySelector('svg');
    const svgClass = svg?.getAttribute('class') || '';
    expect(svgClass).toContain('h-4');
    expect(svgClass).toContain('w-4');
  });

  it('should apply large size class', () => {
    const { container } = render(<LoadingSpinner text="Loading" size="lg" />);
    const svg = container.querySelector('svg');
    const svgClass = svg?.getAttribute('class') || '';
    expect(svgClass).toContain('h-6');
    expect(svgClass).toContain('w-6');
  });
});
