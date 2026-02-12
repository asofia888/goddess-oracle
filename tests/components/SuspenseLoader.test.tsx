import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SuspenseLoader from '../../components/shared/SuspenseLoader';

describe('SuspenseLoader', () => {
  it('should render modal variant by default', () => {
    const { container } = render(<SuspenseLoader message="Loading..." />);
    // Modal variant has fixed positioning
    expect(container.querySelector('.fixed')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render minimal variant without text', () => {
    render(<SuspenseLoader variant="minimal" />);
    // Minimal variant has no message text
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('should render inline variant with message', () => {
    render(<SuspenseLoader variant="inline" message="Loading cards..." />);
    expect(screen.getByText('Loading cards...')).toBeInTheDocument();
  });

  it('should render inline variant without message', () => {
    const { container } = render(<SuspenseLoader variant="inline" />);
    // Should render the spinner div but no text
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should render a spinner element', () => {
    const { container } = render(<SuspenseLoader variant="minimal" />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });
});
