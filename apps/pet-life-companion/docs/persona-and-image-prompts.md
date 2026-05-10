# Persona And Image Prompt Notes

## Target Persona

名前: 佐伯 美咲

年齢: 34歳

生活: 都内近郊の1LDKで犬または猫と暮らす。仕事は忙しいが、暮らしの道具やアプリは静かで上質なものを選ぶ。派手なかわいさより、毎日安心して使える清潔感と信頼感を好む。

課題:
- 病院で「いつから、何回、食欲はどうか」をうまく説明できない。
- 家族やシッターに頼む時、細かい世話メモが散らばる。
- 記録アプリは続けたいが、入力が重いとやめてしまう。
- ペットの体調変化を見逃したくない一方で、不安を煽る表現は苦手。

刺さる体験:
- ホームを開くと今日やることがすぐ分かる。
- 30秒で食事、薬、症状、散歩、写真を残せる。
- 通院前にそのまま見せられる短いメモが作れる。
- Apple純正アプリのように余白、階層、文字が整理されている。

## Image Generation Guidance

OpenAI公式ドキュメントでは、単発生成には Image API、会話的な反復編集には Responses API の image_generation tool が向いている。出力はサイズ、品質、フォーマット、背景を指定できる。プロンプトでは構図、光、被写体、制約を具体的に書き、iOS UIに載せる場合は「no text, no logos, no watermark」「negative space for UI overlay」を明示する。

This project did not call the image API because `OPENAI_API_KEY` was not available in the shell and the current UI can be polished with SwiftUI system materials first.

## Prompts For Rich iOS Assets

1. Photorealistic iOS app hero asset, adult Japanese woman in her 30s sitting near a bright apartment window, gently writing a pet diary on her phone while a small dog rests beside her, soft morning light, warm neutral interior, calm premium lifestyle photography, shallow depth of field, negative space for UI overlay, no text, no logos, no watermark.

2. Subtle lifestyle photo for a Japanese pet care app, close-up of a tidy kitchen counter with a ceramic food bowl, medication packet, small calendar note, and a cat softly out of focus in the background, natural daylight, clean Apple-like composition, muted warm colors, no readable text, no brand marks.

3. Photorealistic app onboarding image, adult Japanese woman checking a pet health record on an iPhone while sitting on a sofa with a relaxed senior cat, quiet home atmosphere, soft fabric textures, natural skin tones, gentle confidence, negative space for UI overlay, no text, no watermark.

4. Premium iOS card background image, top-down view of a neat pet diary scene: phone, handwritten notebook, instant pet photo, leash, small flower vase, neutral Japanese apartment styling, soft shadows, realistic photography, refined and not cute-cartoon, no readable text, no logos.

5. Photorealistic calendar/reminder asset for pet care app, evening entryway scene with dog leash on hook, tote bag, small pet carrier, and a calm dog waiting near the door, warm indoor light, understated Japanese home design, elegant composition, no text, no watermark.
