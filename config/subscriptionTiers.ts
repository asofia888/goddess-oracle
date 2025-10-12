import type { SubscriptionTierConfig } from '../types/subscription';

/**
 * Subscription tier configurations for the freemium model
 *
 * Pricing Strategy:
 * - Free: Limited but valuable (hook users)
 * - Basic: Entry point for committed users
 * - Premium: Best value (most popular)
 * - Guide: Premium offering for power users
 */

export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTierConfig> = {
  free: {
    id: 'free',
    name: {
      ja: 'フリー',
      en: 'Free'
    },
    description: {
      ja: '毎日3回のリーディングで女神の導きを体験',
      en: 'Experience divine guidance with 3 daily readings'
    },
    price: {
      monthly: 0,
      yearly: 0
    },
    priceUSD: {
      monthly: 0,
      yearly: 0
    },
    stripeProductId: '',
    stripePriceId: {
      monthly: '',
      yearly: ''
    },
    limits: {
      dailyReadings: 3,
      deepInsightReadings: false,
      allGoddesses: false, // Only 24 goddesses
      historyDays: 7,
      exportPDF: false,
      monthlyReport: false,
      dedicatedGoddess: false,
      prioritySupport: false,
      aiPersonalization: false
    },
    features: [
      'dailyReadings_3',
      'goddesses_24',
      'history_7days',
      'normalReading'
    ]
  },

  basic: {
    id: 'basic',
    name: {
      ja: 'ベーシック',
      en: 'Basic'
    },
    description: {
      ja: '無制限のリーディングと全女神へのアクセス',
      en: 'Unlimited readings with access to all goddesses'
    },
    price: {
      monthly: 480,
      yearly: 4800 // 2 months free (480 * 10)
    },
    priceUSD: {
      monthly: 4.99,
      yearly: 49.99
    },
    stripeProductId: 'prod_basic', // Replace with actual Stripe product ID
    stripePriceId: {
      monthly: 'price_basic_monthly', // Replace with actual Stripe price ID
      yearly: 'price_basic_yearly'
    },
    limits: {
      dailyReadings: 'unlimited',
      deepInsightReadings: false,
      allGoddesses: true,
      historyDays: 'unlimited',
      exportPDF: false,
      monthlyReport: false,
      dedicatedGoddess: false,
      prioritySupport: false,
      aiPersonalization: false
    },
    features: [
      'unlimitedReadings',
      'allGoddesses_48',
      'unlimitedHistory',
      'normalReading'
    ]
  },

  premium: {
    id: 'premium',
    name: {
      ja: 'プレミアム',
      en: 'Premium'
    },
    description: {
      ja: '深い洞察と月次レポートで魂の成長をサポート',
      en: 'Deep insights and monthly reports for soul growth'
    },
    price: {
      monthly: 980,
      yearly: 9800 // 2 months free (980 * 10)
    },
    priceUSD: {
      monthly: 9.99,
      yearly: 99.99
    },
    stripeProductId: 'prod_premium',
    stripePriceId: {
      monthly: 'price_premium_monthly',
      yearly: 'price_premium_yearly'
    },
    limits: {
      dailyReadings: 'unlimited',
      deepInsightReadings: true,
      allGoddesses: true,
      historyDays: 'unlimited',
      exportPDF: true,
      monthlyReport: true,
      dedicatedGoddess: true,
      prioritySupport: false,
      aiPersonalization: false
    },
    features: [
      'unlimitedReadings',
      'allGoddesses_48',
      'unlimitedHistory',
      'deepInsight',
      'exportPDF',
      'monthlyReport',
      'dedicatedGoddess'
    ]
  },

  guide: {
    id: 'guide',
    name: {
      ja: 'スピリチュアル・ガイド',
      en: 'Spiritual Guide'
    },
    description: {
      ja: 'パーソナルAIガイドと週次カウンセリングレポート',
      en: 'Personal AI guide with weekly counseling reports'
    },
    price: {
      monthly: 1980,
      yearly: 19800 // 2 months free (1980 * 10)
    },
    priceUSD: {
      monthly: 19.99,
      yearly: 199.99
    },
    stripeProductId: 'prod_guide',
    stripePriceId: {
      monthly: 'price_guide_monthly',
      yearly: 'price_guide_yearly'
    },
    limits: {
      dailyReadings: 'unlimited',
      deepInsightReadings: true,
      allGoddesses: true,
      historyDays: 'unlimited',
      exportPDF: true,
      monthlyReport: true,
      dedicatedGoddess: true,
      prioritySupport: true,
      aiPersonalization: true
    },
    features: [
      'unlimitedReadings',
      'allGoddesses_48',
      'unlimitedHistory',
      'deepInsight',
      'exportPDF',
      'monthlyReport',
      'dedicatedGoddess',
      'aiPersonalization',
      'weeklyReport',
      'prioritySupport',
      'earlyAccess'
    ]
  }
};

/**
 * Get subscription tier configuration
 */
export function getSubscriptionTier(tierId: string): SubscriptionTierConfig {
  return SUBSCRIPTION_TIERS[tierId] || SUBSCRIPTION_TIERS.free;
}

/**
 * Feature translations
 */
export const FEATURE_TRANSLATIONS = {
  ja: {
    dailyReadings_3: '1日3回のリーディング',
    unlimitedReadings: '無制限のリーディング',
    goddesses_24: '24柱の女神へのアクセス',
    allGoddesses_48: '全48柱の女神へのアクセス',
    history_7days: '7日間の履歴保存',
    unlimitedHistory: '無制限の履歴保存',
    normalReading: '通常リーディング',
    deepInsight: '深い洞察リーディング',
    exportPDF: 'PDFエクスポート',
    monthlyReport: '月次成長レポート',
    dedicatedGoddess: '専属女神モード',
    aiPersonalization: 'パーソナルAIガイド',
    weeklyReport: '週次カウンセリングレポート',
    prioritySupport: '優先サポート',
    earlyAccess: '新機能の先行アクセス'
  },
  en: {
    dailyReadings_3: '3 readings per day',
    unlimitedReadings: 'Unlimited readings',
    goddesses_24: 'Access to 24 goddesses',
    allGoddesses_48: 'Access to all 48 goddesses',
    history_7days: '7-day history storage',
    unlimitedHistory: 'Unlimited history storage',
    normalReading: 'Normal reading',
    deepInsight: 'Deep insight reading',
    exportPDF: 'PDF export',
    monthlyReport: 'Monthly growth report',
    dedicatedGoddess: 'Dedicated goddess mode',
    aiPersonalization: 'Personal AI guide',
    weeklyReport: 'Weekly counseling report',
    prioritySupport: 'Priority support',
    earlyAccess: 'Early access to new features'
  }
};
