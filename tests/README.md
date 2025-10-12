# 女神のオラクルガイダンス - テストスイート

このディレクトリには、アプリケーションの自動テストが含まれています。

## テスト構成

### 1. APIエンドポイントテスト (`api/generate-message.test.ts`)
- **CORS and Method Validation**: OPTIONS、POSTメソッドの検証
- **Input Validation**: カードデータ、読み取りレベル、言語、モードのバリデーション
- **Rate Limiting**: レート制限機能のテスト（10リクエスト/分）
- **Single Card Message Generation**: 1枚引きのメッセージ生成（日本語・英語）
- **Three Card Message Generation**: 3枚引きのメッセージ生成
- **Error Handling**: APIキー不足、Google AI APIエラー、レスポンス形式エラーの処理

### 2. カード選択テスト (`utils/cardSelection.test.ts`)
- **getGoddessCards**: 言語別カードデータの取得テスト
- **Card Data Integrity**: カードデータの整合性検証
  - 全48枚のカードが存在
  - 必須プロパティの検証（id, name, description, theme, etc.）
  - ユニークなID
  - 有効なelement（fire, water, earth, air, ether）
  - 日本語・英語でカード数が一致
- **Shuffle and Random Selection**: カードのシャッフルと選択機能

### 3. 国際化テスト (`utils/i18n.test.ts`)
- **getTranslation**: 翻訳関数のテスト
- **Translation Keys**: すべての必須翻訳キーの存在確認
- **Translation Content Quality**: 翻訳内容の品質チェック
  - 日本語は日本語文字を使用
  - 英語は英字のみを使用
  - 文化的に適切な表現
- **Three Card Spread Translations**: 過去・現在・未来の翻訳

## テストの実行方法

```bash
# 全テストを実行（ウォッチモード）
npm test

# 全テストを1回だけ実行
npm run test:run

# UIモードで実行
npm run test:ui

# カバレッジレポートを生成
npm run test:coverage
```

## テスト環境

- **テストフレームワーク**: Vitest
- **Reactテストライブラリ**: @testing-library/react
- **DOM環境**: jsdom
- **カバレッジツール**: V8

## カバレッジ目標

- API endpoint: 80%以上
- Card selection: 90%以上
- Internationalization: 90%以上

## 注意事項

1. テストは`tests/`ディレクトリ内に配置されています
2. 各テストファイルは対応するソースファイルの構造に従っています
3. モックは`vitest`の組み込み機能を使用しています
4. APIテストでは、レート制限を回避するため各テストで異なるIPアドレスを使用しています

## テストの追加

新しいテストを追加する場合：

1. `tests/`ディレクトリ内に対応するディレクトリ構造を作成
2. `*.test.ts`または`*.test.tsx`ファイルを作成
3. `describe`と`it`を使用してテストケースを記述
4. 必要に応じてモックを設定

例：
```typescript
import { describe, it, expect } from 'vitest';

describe('My Feature', () => {
  it('should work correctly', () => {
    expect(true).toBe(true);
  });
});
```
