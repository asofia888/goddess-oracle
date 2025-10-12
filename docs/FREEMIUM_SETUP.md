# 🚀 フリーミアムモデル実装ガイド

このドキュメントでは、女神のオラクルアプリのフリーミアムモデルの実装手順を説明します。

## 📋 実装済みの機能

### ✅ 完了
1. **型定義** (`types/subscription.ts`)
   - SubscriptionTier, UserSubscription, ReadingQuota等

2. **サブスクリプションティア設定** (`config/subscriptionTiers.ts`)
   - Free, Basic, Premium, Guideの4つのティア
   - 各ティアの機能制限と価格設定

3. **サブスクリプション管理ユーティリティ** (`utils/subscriptionManager.ts`)
   - クォータチェック
   - 使用量追跡
   - ローカルストレージ管理

4. **UIコンポーネント**
   - PricingModal: 料金プラン選択画面
   - QuotaDisplay: 残りリーディング回数表示

## 🔧 次のステップ：Stripe統合

### 1. Stripeアカウント設定

```bash
# 1. Stripeアカウントを作成
https://dashboard.stripe.com/register

# 2. APIキーを取得
Dashboard > Developers > API keys
- Publishable key (公開可能キー)
- Secret key (シークレットキー)
```

### 2. 環境変数の設定

`.env`ファイルに追加:
```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# 既存
GOOGLE_API_KEY=your_google_api_key_here
```

### 3. Stripe製品とプランの作成

Stripeダッシュボードで以下を作成:

#### Basic Plan
- 製品名: Goddess Oracle Basic
- 月額: ¥480 / $4.99
- 年額: ¥4,800 / $49.99
- Product ID: `prod_basic`
- Price IDs:
  - Monthly: `price_basic_monthly`
  - Yearly: `price_basic_yearly`

#### Premium Plan
- 製品名: Goddess Oracle Premium
- 月額: ¥980 / $9.99
- 年額: ¥9,800 / $99.99
- Product ID: `prod_premium`
- Price IDs:
  - Monthly: `price_premium_monthly`
  - Yearly: `price_premium_yearly`

#### Guide Plan
- 製品名: Goddess Oracle Spiritual Guide
- 月額: ¥1,980 / $19.99
- 年額: ¥19,800 / $199.99
- Product ID: `prod_guide`
- Price IDs:
  - Monthly: `price_guide_monthly`
  - Yearly: `price_guide_yearly`

### 4. 必要なパッケージのインストール

```bash
npm install stripe @stripe/stripe-js
```

### 5. Stripeサーバーレス関数の実装

#### 5.1 チェックアウトセッション作成

`api/create-checkout-session.ts`:
```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { priceId, userId, successUrl, cancelUrl } = req.body;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
      metadata: {
        userId,
      },
    });

    res.status(200).json({ sessionId: session.id });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ error: error.message });
  }
}
```

#### 5.2 Webhookハンドラー

`api/stripe-webhook.ts`:
```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'] as string;

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        // サブスクリプションを有効化
        await activateSubscription(session);
        break;

      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        // サブスクリプションを更新
        await updateSubscription(subscription);
        break;

      case 'customer.subscription.deleted':
        const deletedSub = event.data.object as Stripe.Subscription;
        // サブスクリプションをキャンセル
        await cancelSubscription(deletedSub);
        break;
    }

    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: error.message });
  }
}

// これらの関数は実装が必要（データベース連携）
async function activateSubscription(session: Stripe.Checkout.Session) {
  // TODO: データベースにユーザーのサブスクリプション情報を保存
}

async function updateSubscription(subscription: Stripe.Subscription) {
  // TODO: データベースのサブスクリプション情報を更新
}

async function cancelSubscription(subscription: Stripe.Subscription) {
  // TODO: データベースのサブスクリプションをキャンセル状態に
}
```

### 6. フロントエンドのStripe統合

`utils/stripe.ts`:
```typescript
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export async function redirectToCheckout(
  priceId: string,
  userId: string
) {
  const stripe = await stripePromise;

  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      priceId,
      userId,
      successUrl: `${window.location.origin}/success`,
      cancelUrl: `${window.location.origin}/pricing`,
    }),
  });

  const { sessionId } = await response.json();

  const result = await stripe!.redirectToCheckout({
    sessionId,
  });

  if (result.error) {
    console.error(result.error.message);
  }
}
```

### 7. App.tsxへの統合

```typescript
// App.tsx
import { useState, useEffect } from 'react';
import PricingModal from './components/PricingModal';
import QuotaDisplay from './components/QuotaDisplay';
import { getUserSubscription, getReadingQuota, canPerformReading } from './utils/subscriptionManager';
import { redirectToCheckout } from './utils/stripe';

function App() {
  const [subscription, setSubscription] = useState(getUserSubscription());
  const [showPricing, setShowPricing] = useState(false);

  const quota = getReadingQuota(subscription);

  const handleSelectPlan = async (tier, billingPeriod) => {
    const tierConfig = SUBSCRIPTION_TIERS[tier];
    const priceId = billingPeriod === 'monthly'
      ? tierConfig.stripePriceId.monthly
      : tierConfig.stripePriceId.yearly;

    await redirectToCheckout(priceId, subscription.userId);
  };

  const handleDrawCard = () => {
    const { allowed, reason } = canPerformReading(subscription);

    if (!allowed) {
      if (reason === 'daily_limit_reached') {
        setShowPricing(true);
      }
      return;
    }

    // カード引きのロジック
  };

  return (
    <div>
      {/* クォータ表示 */}
      <QuotaDisplay
        quota={quota}
        language={language}
        onUpgrade={() => setShowPricing(true)}
      />

      {/* 料金プランモーダル */}
      <PricingModal
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
        language={language}
        currentTier={subscription.tier}
        onSelectPlan={handleSelectPlan}
      />
    </div>
  );
}
```

## 📊 データベース（オプション）

ローカルストレージではなく、本格的なデータベースを使用する場合:

### Supabase (推奨)
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL UNIQUE,
  tier TEXT NOT NULL,
  status TEXT NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  readings_count INT DEFAULT 0,
  deep_insight_count INT DEFAULT 0,
  UNIQUE(user_id, date)
);
```

## 📈 アナリティクス統合

### Google Analytics 4

```typescript
// utils/analytics.ts
export function trackSubscriptionEvent(
  event: 'view_pricing' | 'select_plan' | 'upgrade_success' | 'cancel_subscription',
  data: {
    tier?: string;
    billingPeriod?: string;
    value?: number;
  }
) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event, {
      ...data,
      currency: 'JPY',
    });
  }
}
```

## ✅ テストチェックリスト

- [ ] 無料ユーザーは1日3回まで読める
- [ ] リーディング制限に達したらアップグレード促進が表示される
- [ ] Stripeチェックアウトが正常に動作する
- [ ] サブスクリプション後、制限が解除される
- [ ] キャンセル処理が正常に動作する
- [ ] Webhook が正常に受信される
- [ ] 日付が変わるとクォータがリセットされる

## 🚀 本番環境デプロイ前の確認

1. Stripe本番モードのキーに切り替え
2. Webhook URLをVercelの本番URLに設定
3. 環境変数を本番環境に設定
4. テスト決済で動作確認
5. 利用規約・プライバシーポリシーの追加

## 📚 参考リンク

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Stripe Subscriptions](https://stripe.com/docs/billing/subscriptions/overview)
- [Vercel環境変数](https://vercel.com/docs/concepts/projects/environment-variables)

---

最終更新: 2025-10-12
