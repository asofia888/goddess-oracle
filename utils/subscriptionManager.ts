/**
 * Subscription management utilities
 * Handles quota checks, usage tracking, and subscription state
 */

import type { UserSubscription, ReadingQuota, SubscriptionTier } from '../types/subscription';
import { getSubscriptionTier } from '../config/subscriptionTiers';

const STORAGE_KEY = 'user_subscription';
const USAGE_KEY = 'daily_usage';

/**
 * Get user's current subscription
 */
export function getUserSubscription(): UserSubscription {
  if (typeof window === 'undefined') {
    return getDefaultSubscription();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const subscription = JSON.parse(stored);
      // Ensure dates are Date objects
      subscription.currentPeriodStart = new Date(subscription.currentPeriodStart);
      subscription.currentPeriodEnd = new Date(subscription.currentPeriodEnd);
      return subscription;
    }
  } catch (error) {
    console.error('Error loading subscription:', error);
  }

  return getDefaultSubscription();
}

/**
 * Save user subscription
 */
export function saveUserSubscription(subscription: UserSubscription): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subscription));
  } catch (error) {
    console.error('Error saving subscription:', error);
  }
}

/**
 * Get default free subscription
 */
function getDefaultSubscription(): UserSubscription {
  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  return {
    userId: 'guest',
    tier: 'free',
    status: 'active',
    currentPeriodStart: now,
    currentPeriodEnd: nextMonth,
    cancelAtPeriodEnd: false,
    usage: {
      readingsToday: 0,
      deepInsightUsed: 0,
      lastResetDate: now.toISOString().split('T')[0]
    }
  };
}

/**
 * Check if user can perform a reading
 */
export function canPerformReading(
  subscription: UserSubscription,
  isDeepInsight: boolean = false
): { allowed: boolean; reason?: string } {
  const tierConfig = getSubscriptionTier(subscription.tier);

  // Reset daily usage if needed
  resetDailyUsageIfNeeded(subscription);

  // Check deep insight permission
  if (isDeepInsight && !tierConfig.limits.deepInsightReadings) {
    return {
      allowed: false,
      reason: 'upgrade_for_deep_insight'
    };
  }

  // Check daily reading limit
  if (tierConfig.limits.dailyReadings === 'unlimited') {
    return { allowed: true };
  }

  if (subscription.usage.readingsToday >= tierConfig.limits.dailyReadings) {
    return {
      allowed: false,
      reason: 'daily_limit_reached'
    };
  }

  return { allowed: true };
}

/**
 * Record a reading usage
 */
export function recordReadingUsage(
  subscription: UserSubscription,
  isDeepInsight: boolean = false
): UserSubscription {
  resetDailyUsageIfNeeded(subscription);

  const updated = {
    ...subscription,
    usage: {
      ...subscription.usage,
      readingsToday: subscription.usage.readingsToday + 1,
      deepInsightUsed: isDeepInsight
        ? subscription.usage.deepInsightUsed + 1
        : subscription.usage.deepInsightUsed
    }
  };

  saveUserSubscription(updated);
  return updated;
}

/**
 * Get reading quota information
 */
export function getReadingQuota(subscription: UserSubscription): ReadingQuota {
  const tierConfig = getSubscriptionTier(subscription.tier);
  resetDailyUsageIfNeeded(subscription);

  if (tierConfig.limits.dailyReadings === 'unlimited') {
    return {
      available: 'unlimited',
      used: subscription.usage.readingsToday,
      limit: 'unlimited'
    };
  }

  const limit = tierConfig.limits.dailyReadings as number;
  const used = subscription.usage.readingsToday;
  const available = Math.max(0, limit - used);

  // Calculate reset time (midnight tonight)
  const resetTime = new Date();
  resetTime.setHours(24, 0, 0, 0);

  return {
    available,
    used,
    limit,
    resetTime
  };
}

/**
 * Reset daily usage if a new day has started
 */
function resetDailyUsageIfNeeded(subscription: UserSubscription): void {
  const today = new Date().toISOString().split('T')[0];

  if (subscription.usage.lastResetDate !== today) {
    subscription.usage = {
      readingsToday: 0,
      deepInsightUsed: 0,
      lastResetDate: today
    };
    saveUserSubscription(subscription);
  }
}

/**
 * Check if user has access to all goddesses
 */
export function hasAllGoddessesAccess(subscription: UserSubscription): boolean {
  const tierConfig = getSubscriptionTier(subscription.tier);
  return tierConfig.limits.allGoddesses;
}

/**
 * Get available goddess count
 */
export function getAvailableGoddessCount(subscription: UserSubscription): number {
  const tierConfig = getSubscriptionTier(subscription.tier);
  return tierConfig.limits.allGoddesses ? 48 : 24;
}

/**
 * Check if subscription is active
 */
export function isSubscriptionActive(subscription: UserSubscription): boolean {
  if (subscription.tier === 'free') {
    return true;
  }

  return (
    subscription.status === 'active' &&
    new Date() < subscription.currentPeriodEnd
  );
}

/**
 * Upgrade subscription tier
 */
export function upgradeSubscription(
  currentSubscription: UserSubscription,
  newTier: SubscriptionTier,
  stripeSubscriptionId: string,
  stripeCustomerId: string
): UserSubscription {
  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  const updated: UserSubscription = {
    ...currentSubscription,
    tier: newTier,
    status: 'active',
    stripeSubscriptionId,
    stripeCustomerId,
    currentPeriodStart: now,
    currentPeriodEnd: nextMonth,
    cancelAtPeriodEnd: false
  };

  saveUserSubscription(updated);
  return updated;
}

/**
 * Cancel subscription (at period end)
 */
export function cancelSubscription(subscription: UserSubscription): UserSubscription {
  const updated = {
    ...subscription,
    cancelAtPeriodEnd: true
  };

  saveUserSubscription(updated);
  return updated;
}

/**
 * Get upgrade prompts based on current tier
 */
export function getUpgradePrompt(
  currentTier: SubscriptionTier,
  language: 'ja' | 'en'
): { title: string; message: string; cta: string } {
  const prompts = {
    ja: {
      free: {
        title: '今日のリーディング回数に達しました',
        message: 'ベーシックプランにアップグレードして、無制限のリーディングと全48柱の女神へのアクセスを手に入れましょう。',
        cta: 'プランを見る'
      },
      basic: {
        title: '深い洞察リーディングを体験',
        message: 'プレミアムプランで、魂の成長を促す深い洞察とパーソナライズされたガイダンスを受け取りましょう。',
        cta: 'プレミアムにアップグレード'
      },
      premium: {
        title: 'パーソナルAIガイドを体験',
        message: 'スピリチュアル・ガイドプランで、あなた専用のAIガイドと週次カウンセリングレポートを受け取りましょう。',
        cta: 'ガイドプランを見る'
      }
    },
    en: {
      free: {
        title: 'Daily Reading Limit Reached',
        message: 'Upgrade to Basic for unlimited readings and access to all 48 goddesses.',
        cta: 'View Plans'
      },
      basic: {
        title: 'Experience Deep Insight Readings',
        message: 'Upgrade to Premium for deep insights and personalized guidance for soul growth.',
        cta: 'Upgrade to Premium'
      },
      premium: {
        title: 'Get Your Personal AI Guide',
        message: 'Upgrade to Spiritual Guide for your personal AI guide and weekly counseling reports.',
        cta: 'View Guide Plan'
      }
    }
  };

  return prompts[language][currentTier] || prompts[language].free;
}
