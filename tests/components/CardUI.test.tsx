import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CardTheme from '../../components/ui/CardTheme';
import CardAffirmation from '../../components/ui/CardAffirmation';
import CardGuidance from '../../components/ui/CardGuidance';

describe('CardTheme', () => {
  it('should render theme text', () => {
    render(<CardTheme theme="Love & Beauty" />);
    expect(screen.getByText('Love & Beauty')).toBeInTheDocument();
  });

  it('should render with default label', () => {
    render(<CardTheme theme="Wisdom" />);
    expect(screen.getByText('テーマ')).toBeInTheDocument();
  });

  it('should render with custom label', () => {
    render(<CardTheme theme="Wisdom" label="Theme" />);
    expect(screen.getByText('Theme')).toBeInTheDocument();
  });

  it('should apply center alignment by default', () => {
    const { container } = render(<CardTheme theme="Test" />);
    const heading = container.querySelector('h3');
    expect(heading?.className).toContain('text-center');
  });

  it('should apply left alignment when specified', () => {
    const { container } = render(<CardTheme theme="Test" alignment="left" />);
    const heading = container.querySelector('h3');
    expect(heading?.className).toContain('text-left');
  });
});

describe('CardAffirmation', () => {
  it('should render affirmation text with quotes', () => {
    render(<CardAffirmation affirmation="I am worthy of love." />);
    expect(screen.getByText(/"I am worthy of love."/)).toBeInTheDocument();
  });

  it('should render with default label', () => {
    render(<CardAffirmation affirmation="Test" />);
    expect(screen.getByText('アファメーション')).toBeInTheDocument();
  });

  it('should render with custom label', () => {
    render(<CardAffirmation affirmation="Test" label="Affirmation" />);
    expect(screen.getByText('Affirmation')).toBeInTheDocument();
  });
});

describe('CardGuidance', () => {
  const guidance = ['Practice self-care', 'Express gratitude', 'Be kind'];

  it('should render all guidance items', () => {
    render(<CardGuidance guidance={guidance} />);
    expect(screen.getByText('Practice self-care')).toBeInTheDocument();
    expect(screen.getByText('Express gratitude')).toBeInTheDocument();
    expect(screen.getByText('Be kind')).toBeInTheDocument();
  });

  it('should render with default label', () => {
    render(<CardGuidance guidance={guidance} />);
    expect(screen.getByText('日常のガイダンス')).toBeInTheDocument();
  });

  it('should render with custom label', () => {
    render(<CardGuidance guidance={guidance} label="Daily Guidance" />);
    expect(screen.getByText('Daily Guidance')).toBeInTheDocument();
  });

  it('should render correct number of list items', () => {
    render(<CardGuidance guidance={guidance} />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
  });

  it('should handle empty guidance array', () => {
    render(<CardGuidance guidance={[]} />);
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });
});
