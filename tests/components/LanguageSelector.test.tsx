import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LanguageSelector from '../../components/LanguageSelector';

describe('LanguageSelector', () => {
  it('should display the current language', () => {
    render(<LanguageSelector currentLanguage="en" onLanguageChange={() => {}} />);
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('should display Japanese when ja is selected', () => {
    render(<LanguageSelector currentLanguage="ja" onLanguageChange={() => {}} />);
    expect(screen.getByText('日本語')).toBeInTheDocument();
  });

  it('should have aria-expanded=false when dropdown is closed', () => {
    render(<LanguageSelector currentLanguage="en" onLanguageChange={() => {}} />);
    const button = screen.getByRole('button', { name: 'Select language' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('should have aria-haspopup="listbox"', () => {
    render(<LanguageSelector currentLanguage="en" onLanguageChange={() => {}} />);
    const button = screen.getByRole('button', { name: 'Select language' });
    expect(button).toHaveAttribute('aria-haspopup', 'listbox');
  });

  it('should open dropdown and set aria-expanded=true on click', () => {
    render(<LanguageSelector currentLanguage="en" onLanguageChange={() => {}} />);
    const button = screen.getByRole('button', { name: 'Select language' });
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('should render language options with role="option"', () => {
    render(<LanguageSelector currentLanguage="en" onLanguageChange={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Select language' }));
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(2);
  });

  it('should mark the current language with aria-selected=true', () => {
    render(<LanguageSelector currentLanguage="en" onLanguageChange={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Select language' }));
    const options = screen.getAllByRole('option');
    const englishOption = options.find(opt => opt.textContent?.includes('English'));
    const japaneseOption = options.find(opt => opt.textContent?.includes('日本語'));
    expect(englishOption).toHaveAttribute('aria-selected', 'true');
    expect(japaneseOption).toHaveAttribute('aria-selected', 'false');
  });

  it('should call onLanguageChange when a language is selected', () => {
    const handleChange = vi.fn();
    render(<LanguageSelector currentLanguage="en" onLanguageChange={handleChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Select language' }));
    const japaneseOption = screen.getAllByRole('option').find(opt => opt.textContent?.includes('日本語'));
    fireEvent.click(japaneseOption!);
    expect(handleChange).toHaveBeenCalledWith('ja');
  });

  it('should close dropdown after selecting a language', () => {
    render(<LanguageSelector currentLanguage="en" onLanguageChange={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Select language' }));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    const japaneseOption = screen.getAllByRole('option').find(opt => opt.textContent?.includes('日本語'));
    fireEvent.click(japaneseOption!);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('should close dropdown on Escape key', () => {
    render(<LanguageSelector currentLanguage="en" onLanguageChange={() => {}} />);
    const button = screen.getByRole('button', { name: 'Select language' });
    fireEvent.click(button);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.keyDown(button, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('should close dropdown when clicking outside', () => {
    render(
      <div>
        <p>Outside</p>
        <LanguageSelector currentLanguage="en" onLanguageChange={() => {}} />
      </div>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Select language' }));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByText('Outside'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
