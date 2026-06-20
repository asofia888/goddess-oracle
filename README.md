<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 女神のオラクルガイダンス / Goddess Oracle Guidance

48柱の女神カードからリーディングを行うオラクルカード Web アプリです。1枚引き・3枚引き（過去／現在／未来）に対応し、AIが生成したパーソナルなメッセージと女神のアートワークを表示します。日本語・英語対応。

**Live:** https://goddess-oracle.vercel.app

## 主な機能

- 🔮 1枚引き / 3枚引き（過去・現在・未来）スプレッド
- 🌗 通常リーディング / 深い洞察リーディング
- 🤖 Google Generative AI によるパーソナライズされたメッセージ生成
- 🖼️ 女神ごとのアートワーク表示
- 📓 リーディング履歴（ブラウザの localStorage に保存）
- 🌐 日本語・英語（ブラウザの言語設定から自動判定）

## 技術スタック

- **フロントエンド:** React 19 + TypeScript + Vite + Tailwind CSS v4
- **API:** Vercel Serverless Functions（`api/generate-message.ts`）
- **AI:** Google Generative AI（Gemini）
- **レート制限:** Upstash Redis（未設定時はインメモリにフォールバック）
- **テスト / CI:** Vitest + GitHub Actions

## ローカルでの実行

**前提:** Node.js 22.x

1. 依存関係をインストール:
   ```bash
   npm install
   ```
2. 環境変数を設定: [.env.example](.env.example) をコピーして `.env.local` を作成し、値を設定します。
   ```bash
   cp .env.example .env.local
   ```
   - `GOOGLE_API_KEY` … Google Generative AI の API キー（[取得はこちら](https://makersuite.google.com/app/apikey)）。**サーバーサイドでのみ使用**します。
   - `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` …（任意）本番のレート制限用。未設定でもインメモリ方式で動作します。
3. 開発サーバーを起動:
   ```bash
   npm run dev
   ```

> メッセージ生成 API（`/api/generate-message`）は Vercel の関数として動作します。ローカルで関数も含めて動かす場合は `vercel dev` を使用してください。API が利用できない場合は、各カードの既定メッセージにフォールバックします。

## スクリプト

```bash
npm run typecheck   # 型チェック
npm run test        # テスト（watch）
npm run test:run    # テスト（1回実行）
npm run build       # 本番ビルド
```

## デプロイ（Vercel）

1. リポジトリを Vercel に接続します（Node.js 22.x）。
2. プロジェクトの **Environment Variables** に `GOOGLE_API_KEY`（および任意で Upstash の 2 変数）を設定します。
3. push すると自動でビルド・デプロイされます。

セキュリティ設計（レート制限・オリジン検証・入力バリデーション等）は [SECURITY.md](SECURITY.md) を参照してください。

## OGP / SEO

OGP・Twitter Card・JSON-LD 構造化データは `index.html` に設定済みです。OGP 画像は `public/ogp.webp`（1200×630, WebP）を使用しています。差し替える場合は、同じパス・サイズの WebP を配置してください。
