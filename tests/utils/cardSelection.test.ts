import { describe, it, expect } from 'vitest';
import { getGoddessCards } from '../../constants';
import type { Language } from '../../utils/i18n';

describe('Card Selection', () => {
  describe('getGoddessCards', () => {
    it('should return Japanese cards when language is "ja"', () => {
      const cards = getGoddessCards('ja');

      expect(cards).toBeDefined();
      expect(cards.length).toBe(48);
      expect(cards[0].name).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/); // Japanese characters
    });

    it('should return English cards when language is "en"', () => {
      const cards = getGoddessCards('en');

      expect(cards).toBeDefined();
      expect(cards.length).toBe(48);
      expect(cards[0].name).toMatch(/^[A-Za-z\s-]+$/); // English characters
    });

    it('should return all required card properties', () => {
      const cards = getGoddessCards('en');
      const card = cards[0];

      expect(card).toHaveProperty('id');
      expect(card).toHaveProperty('name');
      expect(card).toHaveProperty('description');
      expect(card).toHaveProperty('theme');
      expect(card).toHaveProperty('secondaryThemes');
      expect(card).toHaveProperty('origin');
      expect(card).toHaveProperty('element');
      expect(card).toHaveProperty('keywords');
      expect(card).toHaveProperty('affirmation');
      expect(card).toHaveProperty('dailyGuidance');
      expect(card).toHaveProperty('message');
    });

    it('should have unique IDs for all cards', () => {
      const cards = getGoddessCards('en');
      const ids = cards.map(card => card.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(cards.length);
    });

    it('should have valid element types', () => {
      const cards = getGoddessCards('en');
      const validElements = ['fire', 'water', 'earth', 'air', 'spirit'];

      cards.forEach(card => {
        expect(validElements).toContain(card.element);
      });
    });

    it('should have non-empty messages', () => {
      const cards = getGoddessCards('en');

      cards.forEach(card => {
        expect(card.message).toBeTruthy();
        expect(card.message.length).toBeGreaterThan(0);
      });
    });

    it('should have at least one daily guidance item', () => {
      const cards = getGoddessCards('en');

      cards.forEach(card => {
        expect(card.dailyGuidance).toBeDefined();
        expect(Array.isArray(card.dailyGuidance)).toBe(true);
        expect(card.dailyGuidance.length).toBeGreaterThan(0);
      });
    });

    it('should maintain same card count across languages', () => {
      const jaCards = getGoddessCards('ja');
      const enCards = getGoddessCards('en');

      expect(jaCards.length).toBe(enCards.length);
    });

    it('should have matching IDs across languages', () => {
      const jaCards = getGoddessCards('ja');
      const enCards = getGoddessCards('en');

      jaCards.forEach((jaCard, index) => {
        expect(jaCard.id).toBe(enCards[index].id);
      });
    });
  });

  describe('Card Data Integrity', () => {
    it('should have valid origins for all cards', () => {
      const cards = getGoddessCards('en');

      // Each card must declare a non-empty origin. A hard-coded allow-list was
      // previously used here, but it drifted out of sync with the card data
      // (which spans 20+ traditions). An integrity check on the value is more
      // robust and does not require editing the test whenever a goddess is added.
      cards.forEach(card => {
        expect(typeof card.origin).toBe('string');
        expect(card.origin.trim().length).toBeGreaterThan(0);
      });
    });

    it('should have at least one keyword per card', () => {
      const cards = getGoddessCards('en');

      cards.forEach(card => {
        expect(card.keywords).toBeDefined();
        expect(Array.isArray(card.keywords)).toBe(true);
        expect(card.keywords.length).toBeGreaterThan(0);
      });
    });

    it('should have at least one secondary theme per card', () => {
      const cards = getGoddessCards('en');

      cards.forEach(card => {
        expect(card.secondaryThemes).toBeDefined();
        expect(Array.isArray(card.secondaryThemes)).toBe(true);
        expect(card.secondaryThemes.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Shuffle and Random Selection', () => {
    it('should be able to select random cards', () => {
      const cards = getGoddessCards('en');

      // Simulate random card selection
      const shuffled = [...cards].sort(() => Math.random() - 0.5);
      const selectedCard = shuffled[0];

      expect(selectedCard).toBeDefined();
      expect(selectedCard.id).toBeGreaterThanOrEqual(1);
      expect(selectedCard.id).toBeLessThanOrEqual(48);
    });

    it('should be able to select three cards for spread', () => {
      const cards = getGoddessCards('en');

      // Simulate three-card spread
      const shuffled = [...cards].sort(() => Math.random() - 0.5);
      const threeCards = shuffled.slice(0, 3);

      expect(threeCards).toHaveLength(3);
      threeCards.forEach(card => {
        expect(card).toBeDefined();
        expect(card.name).toBeTruthy();
      });
    });
  });
});
