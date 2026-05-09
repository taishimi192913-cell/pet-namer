# Phase 0: Sippomi 構造化プロンプト（全サブエージェント共通参照）

> 全サブエージェント（Design / Material / Developer / QA）が共通で参照する。
> 動画「Claude Design × ChatGPT Image-2 でLP制作」のフローに従い、目的・ターゲット・トンマナ・デザイン要件を構造化。

## プロジェクト概要

| 項目 | 内容 |
|------|------|
| サービス名 | Sippomi（しっぽみ） |
| URL | https://sippomi.com |
| 目的 | ペットの名前をAIが無料で診断・提案するWebサービス |
| 業種 | ペット / ライフスタイル / 命名支援 / コミュニティ |
| ターゲット | 初めてペットを飼う20-40代女性・家族 |
| 全機能無料 | IAP / サブスク / 広告 一切なし |

## トンマナ（雰囲気・世界観）

```
Apple Japanの大胆で洗練されたプロダクトページ × MUJIの静かで落ち着いたライフスタイル誌面
```

| 形容詞 | 重み |
|--------|------|
| 温かみのある | ★★★ |
| 洗練された（ミニマル） | ★★★ |
| 落ち着いた | ★★☆ |
| 信頼できる | ★★☆ |
| やさしい | ★★☆ |

## カラーパレット

| 役割 | 色名 | 値 |
|------|------|-----|
| 背景ベース | MUJI生成り | `#f4eede` — `hsl(42 46% 94%)` |
| テキスト基本 | Apple Dark Gray | `#1d1d1f` — `hsl(240 2% 12%)` |
| テキスト補助 | Apple Gray | `#6e6e73` — `hsl(240 2% 45%)` |
| CTAメイン | Apple Blue | `#0071e3` — `hsl(211 100% 45%)` |
| アクセント1 | Soft Orange | `#F9A66C` — `hsl(29 84% 70%)` |
| アクセント2 | Terracotta | `#E07A5F` — `hsl(14 66% 62%)` |
| テキスト強調 | Dark Brown | `#3D2C2A` — `hsl(10 15% 18%)` |
| カード背景 | Cream White | `#FFF8F0` — `hsl(34 100% 96%)` |

## LPセクション構成（7セクション）

```
1. [Hero] メインキャッチ + ペットシルエット + CTA「名前を診断する」
2. [Features] 3枚の特徴カード
3. [How It Works] 3ステップ診断フロー
4. [Trust/Stats] 信頼セクション
5. [Trending] 人気の名前ランキング
6. [Community] コミュニティ参加
7. [CTA Footer] 最終CTA「今すぐ名前を診断する」
```

## デザイン要件

- 不規則で柔らかい抽象形状（blob）を背景に使用
- 直線・硬い矩形は避け、曲線的で有機的な形状
- カード角丸: 16-28px
- セクション間余白: 120-200px
- フォント: `-apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Kaku Gothic ProN", sans-serif`
- CTAボタン: ピル型（border-radius: 9999px）+ シャドウ

## 禁止事項

- 絵文字禁止 / 蛍光色・原色禁止 / 過剰グラデーション禁止
- 純黒 `#000` / 純白 `#FFF` 禁止
- Material Design / Material Icons 禁止

## gpt-image-2 生成用プロンプト（英語）

```
A warm and sophisticated landing page design for a pet name diagnosis web service.
Target: first-time pet owners (women and families, 20-40s).
Style: Apple Japan product page × MUJI lifestyle magazine hybrid.
Mood: warm, refined, calm, trustworthy, gentle — with subtle playfulness.

Color palette: warm cream base (#f4eede), soft orange accents, terracotta, dark brown text, Apple blue CTA.
Use irregular soft blob shapes in the background — organic, curved, flowing.
Large card layouts with generous rounded corners (24-28px).
Abundant whitespace between sections (120-200px).
No emoji, no neon colors, no Material Design, no pure black/white.
Output: 1024x1536 vertical layout.

Sections from top to bottom:
1. Hero — large headline "Find the perfect name for your new family", pet silhouettes (dog, cat, rabbit), big pill CTA
2. Features — 3 feature cards with soft blob icons
3. How It Works — 3-step flow with gentle connecting curves  
4. Trust section — numbers and badges
5. Trending names — ranking cards
6. Community section
7. Footer CTA

Also generate a second image as an asset grid: extract background blobs (3-5 shapes), divider curves, card textures, and pet silhouette line art (dog/cat/rabbit) arranged in a grid. Each element should be separable for individual use.

Make it look like a professional designer made it — no generic AI aesthetic.
```
