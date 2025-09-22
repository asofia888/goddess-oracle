<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1o31BlCTBp2cE0vRK6kvtl8lTNy0CfgPe

**Deployed on Vercel with Node.js 22.x support**

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

---

## OGP画像の作成について

現在、OGP（Open Graph Protocol）画像はプレースホルダーファイルとして配置されています。

### 推奨される画像仕様
- **サイズ**: 1200×630ピクセル
- **フォーマット**: JPG
- **ファイル名**: `public/ogp-image.jpg`

### 画像作成ツールの提案
以下のツールで美しいOGP画像を作成できます：

#### 1. Canva
- テンプレート: "Facebook投稿" または "Twitterヘッダー"
- サイズを1200×630に調整
- スピリチュアル系のテンプレートを選択

#### 2. Figma
- フレームサイズ: 1200×630
- グラデーション背景: 紫系（#faf5ff → #f3e8ff）
- フォント: エレガントなセリフ体

#### 3. Adobe Photoshop/Illustrator
- 高品質なグラフィック作成が可能

### 画像内容の推奨要素
- アプリタイトル「女神のオラクルガイダンス」
- 英語タイトル「Goddess Oracle Guidance」
- 女神やスピリチュアルなモチーフ
- 4言語対応の表示（🌟 日本語 • English • Español • Français 🌟）
- エレガントな紫・琥珀色のカラーパレット

### 現在のOGPメタタグ
HTMLファイルには完全なOGPメタタグが設定済みです：
- Facebook、Twitter用の最適化
- 多言語対応（ja_JP, en_US, es_ES, fr_FR）
- 適切な画像サイズとalt属性
