/**
 * Ollama ヘルパー（完全ローカル・無料）
 * 使い方: node ollama-helper.mjs "質問" [モデル名]
 * 例: node ollama-helper.mjs "ペットの名前を5つ" qwen2.5:7b
 *     node ollama-helper.mjs "猫の名前を提案して" gemma3
 */
const [,, prompt, model = "qwen2.5:7b"] = process.argv;

if (!prompt) {
  console.error('使い方: node ollama-helper.mjs "質問" [モデル名]');
  process.exit(1);
}

console.log(`🦙 Ollama（${model}）に質問中...\n`);

const res = await fetch("http://localhost:11434/api/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ model, prompt, stream: false }),
  signal: AbortSignal.timeout(120_000), // 2分タイムアウト
});

if (!res.ok) {
  console.error(`❌ エラー: HTTP ${res.status} — モデル "${model}" が存在しないかもしれません`);
  console.error('利用可能モデル確認: ollama list');
  process.exit(1);
}

const data = await res.json();
console.log(data.response);
