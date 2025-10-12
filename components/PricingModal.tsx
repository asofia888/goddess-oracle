import React, { useState } from 'react';
import Modal from './shared/Modal';
import { SUBSCRIPTION_TIERS, FEATURE_TRANSLATIONS } from '../config/subscriptionTiers';
import type { Language } from '../utils/i18n';
import type { SubscriptionTier } from '../types/subscription';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  currentTier?: SubscriptionTier;
  onSelectPlan: (tier: SubscriptionTier, billingPeriod: 'monthly' | 'yearly') => void;
}

const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  language,
  currentTier = 'free',
  onSelectPlan
}) => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const t = {
    ja: {
      title: '料金プラン',
      subtitle: 'あなたに最適なプランを選択してください',
      monthly: '月額',
      yearly: '年額',
      yearlyDiscount: '(2ヶ月分お得)',
      perMonth: '/月',
      currentPlan: '現在のプラン',
      selectPlan: 'プランを選択',
      upgrade: 'アップグレード',
      features: '機能',
      popularBadge: '人気',
      bestValueBadge: '最もお得',
      cancel: 'キャンセル'
    },
    en: {
      title: 'Pricing Plans',
      subtitle: 'Choose the perfect plan for your spiritual journey',
      monthly: 'Monthly',
      yearly: 'Yearly',
      yearlyDiscount: '(Save 2 months)',
      perMonth: '/month',
      currentPlan: 'Current Plan',
      selectPlan: 'Select Plan',
      upgrade: 'Upgrade',
      features: 'Features',
      popularBadge: 'Popular',
      bestValueBadge: 'Best Value',
      cancel: 'Cancel'
    }
  };

  const text = t[language];
  const featureTexts = FEATURE_TRANSLATIONS[language];

  const tierOrder: SubscriptionTier[] = ['free', 'basic', 'premium', 'guide'];
  const popularTier = 'premium';
  const bestValueTier = 'guide';

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-orange-800 mb-2">
              {text.title}
            </h2>
            <p className="text-amber-700">
              {text.subtitle}
            </p>
          </div>

          {/* Billing Period Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-amber-100 p-1 rounded-full inline-flex">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-white text-amber-800 shadow'
                    : 'text-amber-700 hover:text-amber-900'
                }`}
              >
                {text.monthly}
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                  billingPeriod === 'yearly'
                    ? 'bg-white text-amber-800 shadow'
                    : 'text-amber-700 hover:text-amber-900'
                }`}
              >
                {text.yearly} <span className="text-xs">{text.yearlyDiscount}</span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {tierOrder.map(tierId => {
              const tier = SUBSCRIPTION_TIERS[tierId];
              const isCurrentTier = tierId === currentTier;
              const isPopular = tierId === popularTier;
              const isBestValue = tierId === bestValueTier;
              const price = billingPeriod === 'monthly' ? tier.price.monthly : tier.price.yearly / 12;

              return (
                <div
                  key={tierId}
                  className={`relative rounded-xl border-2 p-6 transition-all hover:shadow-lg ${
                    isPopular || isBestValue
                      ? 'border-amber-500 shadow-md'
                      : 'border-gray-200'
                  }`}
                >
                  {/* Badge */}
                  {(isPopular || isBestValue) && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        {isPopular ? text.popularBadge : text.bestValueBadge}
                      </span>
                    </div>
                  )}

                  {/* Tier Name */}
                  <h3 className="text-xl font-bold text-orange-800 mb-2">
                    {tier.name[language]}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-amber-700 mb-4 h-12">
                    {tier.description[language]}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="text-3xl font-bold text-slate-800">
                      {price === 0 ? (
                        language === 'ja' ? '無料' : 'Free'
                      ) : (
                        <>
                          ¥{Math.round(price).toLocaleString()}
                          <span className="text-lg font-normal text-gray-600">
                            {text.perMonth}
                          </span>
                        </>
                      )}
                    </div>
                    {billingPeriod === 'yearly' && price > 0 && (
                      <div className="text-sm text-green-600 mt-1">
                        {language === 'ja' ? '年間 ¥' : '¥'}
                        {tier.price.yearly.toLocaleString()}
                        {language === 'ja' ? '/年' : '/year'}
                      </div>
                    )}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => {
                      if (!isCurrentTier) {
                        onSelectPlan(tierId as SubscriptionTier, billingPeriod);
                      }
                    }}
                    disabled={isCurrentTier}
                    className={`w-full py-3 rounded-lg font-semibold transition-all mb-6 ${
                      isCurrentTier
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : isPopular || isBestValue
                        ? 'bg-amber-600 text-white hover:bg-amber-500'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    {isCurrentTier
                      ? text.currentPlan
                      : tierId === 'free'
                      ? text.selectPlan
                      : text.upgrade}
                  </button>

                  {/* Features */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="text-sm font-semibold text-gray-700 mb-3">
                      {text.features}
                    </div>
                    <ul className="space-y-2">
                      {tier.features.map(featureKey => (
                        <li key={featureKey} className="flex items-start text-sm">
                          <svg
                            className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span className="text-gray-700">
                            {featureTexts[featureKey]}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Close Button */}
          <div className="text-center">
            <button
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              {text.cancel}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PricingModal;
