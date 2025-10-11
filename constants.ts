import type { GoddessCardData, Language } from './types';
import { GODDESS_CARDS as GODDESS_CARDS_JA } from './constants/ja';
import { GODDESS_CARDS as GODDESS_CARDS_EN } from './constants/en';

export const getGoddessCards = (language: Language): GoddessCardData[] => {
  switch (language) {
    case 'ja':
      return GODDESS_CARDS_JA;
    case 'en':
      return GODDESS_CARDS_EN;
    default:
      return GODDESS_CARDS_EN;
  }
};

// For backward compatibility, export the default (Japanese) cards
export const GODDESS_CARDS = GODDESS_CARDS_JA;
