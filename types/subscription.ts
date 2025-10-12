/**
 * Subscription and billing types for the freemium model
 */

export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'guide';

export interface SubscriptionLimits {
  // Reading limits
  dailyReadings: number | 'unlimited';
  deepInsightReadings: boolean;

  // Feature access
  allGoddesses: boolean;
  historyDays: number | 'unlimited';
  exportPDF: boolean;

  // Premium features
  monthlyReport: boolean;
  dedicatedGoddess: boolean;
  prioritySupport: boolean;
  aiPersonalization: boolean;
}

export interface SubscriptionTierConfig {
  id: SubscriptionTier;
  name: {
    ja: string;
    en: string;
  };
  description: {
    ja: string;
    en: string;
  };
  price: {
    monthly: number; // in yen
    yearly: number;  // in yen (with discount)
  };
  priceUSD: {
    monthly: number;
    yearly: number;
  };
  stripeProductId: string;
  stripePriceId: {
    monthly: string;
    yearly: string;
  };
  limits: SubscriptionLimits;
  features: string[]; // Feature keys for display
}

export interface UserSubscription {
  userId: string;
  tier: SubscriptionTier;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;

  // Usage tracking
  usage: {
    readingsToday: number;
    deepInsightUsed: number;
    lastResetDate: string; // ISO date string
  };
}

export interface ReadingQuota {
  available: number | 'unlimited';
  used: number;
  limit: number | 'unlimited';
  resetTime?: Date;
}

export interface SubscriptionAnalytics {
  tier: SubscriptionTier;
  readingCount: number;
  deepInsightCount: number;
  sessionDuration: number;
  lastActive: Date;
  retentionDays: number;
}
