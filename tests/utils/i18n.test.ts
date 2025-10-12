import { describe, it, expect } from 'vitest';
import { getTranslation, type Language } from '../../utils/i18n';

describe('Internationalization (i18n)', () => {
  describe('getTranslation', () => {
    it('should return Japanese translations for "ja"', () => {
      const t = getTranslation('ja');

      expect(t.appTitle).toBe('女神のオラクル');
      expect(t.singleCard).toBe('1枚引き');
      expect(t.threeCards).toBe('3枚引き');
      expect(t.journal).toBe('ジャーナル');
    });

    it('should return English translations for "en"', () => {
      const t = getTranslation('en');

      expect(t.appTitle).toBe('Goddess Oracle');
      expect(t.singleCard).toBe('Single Card');
      expect(t.threeCards).toBe('Three Cards');
      expect(t.journal).toBe('Journal');
    });

    it('should return translations for both languages', () => {
      const jaT = getTranslation('ja');
      const enT = getTranslation('en');

      expect(jaT).toBeDefined();
      expect(enT).toBeDefined();
    });

    it('should have all required translation keys', () => {
      const requiredKeys = [
        'appTitle',
        'subtitle',
        'singleCard',
        'threeCards',
        'shuffleCards',
        'journal',
        'manual',
        'disclaimer',
        'past',
        'present',
        'future',
        'cardReading',
        'threeCardSpread',
        'close',
        'clearAll',
        'noReadings',
        'readingHistory',
        'howToUse',
        'important',
        'entertainment',
        'disclaimerText',
        'iUnderstand',
        'theme',
        'affirmation',
        'dailyGuidance',
        'save',
        'saved',
        'saveReading',
        'loadingGoddessImage',
        'loadingMessage',
        'loadingThreeCards',
        'loadingImages',
      ];

      const jaTranslations = getTranslation('ja');
      const enTranslations = getTranslation('en');

      requiredKeys.forEach(key => {
        expect(jaTranslations).toHaveProperty(key);
        expect(enTranslations).toHaveProperty(key);
        expect(jaTranslations[key as keyof typeof jaTranslations]).toBeTruthy();
        expect(enTranslations[key as keyof typeof enTranslations]).toBeTruthy();
      });
    });

    it('should have consistent translation keys across languages', () => {
      const jaTranslations = getTranslation('ja');
      const enTranslations = getTranslation('en');

      const jaKeys = Object.keys(jaTranslations).sort();
      const enKeys = Object.keys(enTranslations).sort();

      expect(jaKeys).toEqual(enKeys);
    });

    it('should have non-empty values for all translations', () => {
      const languages: Language[] = ['ja', 'en'];

      languages.forEach(lang => {
        const translations = getTranslation(lang);

        Object.entries(translations).forEach(([key, value]) => {
          expect(value).toBeTruthy();
          expect(value.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Translation Content Quality', () => {
    it('should use appropriate Japanese characters for Japanese translations', () => {
      const t = getTranslation('ja');

      // Check that Japanese translations contain Japanese characters
      expect(t.appTitle).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/);
      expect(t.singleCard).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/);
    });

    it('should use appropriate English characters for English translations', () => {
      const t = getTranslation('en');

      // Check that English translations contain only Latin characters
      expect(t.appTitle).toMatch(/^[A-Za-z\s]+$/);
      expect(t.singleCard).toMatch(/^[A-Za-z\s]+$/);
    });

    it('should have culturally appropriate loading messages', () => {
      const jaT = getTranslation('ja');
      const enT = getTranslation('en');

      // Japanese should have more poetic/spiritual language
      expect(jaT.loadingGoddessImage).toContain('女神');
      expect(jaT.loadingMessage).toContain('メッセージ');

      // English should be clear and descriptive
      expect(enT.loadingGoddessImage).toContain('Goddess');
      expect(enT.loadingMessage).toContain('message');
    });

    it('should have appropriate button text for actions', () => {
      const jaT = getTranslation('ja');
      const enT = getTranslation('en');

      // Save button
      expect(jaT.saveReading).toBeTruthy();
      expect(enT.saveReading).toBe('Save Reading');

      // Saved confirmation
      expect(jaT.saved).toBeTruthy();
      expect(enT.saved).toBe('Saved');

      // Close button
      expect(jaT.close).toBeTruthy();
      expect(enT.close).toBe('Close');
    });
  });

  describe('Three Card Spread Translations', () => {
    it('should have translations for card positions', () => {
      const jaT = getTranslation('ja');
      const enT = getTranslation('en');

      expect(jaT.past).toBeTruthy();
      expect(jaT.present).toBeTruthy();
      expect(jaT.future).toBeTruthy();

      expect(enT.past).toBe('Past');
      expect(enT.present).toBe('Present');
      expect(enT.future).toBe('Future');
    });

    it('should have translation for three card spread title', () => {
      const jaT = getTranslation('ja');
      const enT = getTranslation('en');

      expect(jaT.threeCardSpread).toBeTruthy();
      expect(enT.threeCardSpread).toBe('Three Card Spread');
    });
  });
});
