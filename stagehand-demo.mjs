/**
 * Stagehand + Ollama（完全ローカル・無料）
 * 使い方: node stagehand-demo.mjs [モデル名]
 * 例: node stagehand-demo.mjs qwen2.5:7b
 *     node stagehand-demo.mjs gemma3
 */
import { Stagehand } from "@browserbasehq/stagehand";

const model = process.argv[2] ?? "qwen2.5:7b";
console.log(`🦙 Stagehand + Ollama（${model}）起動中...`);

const stagehand = new Stagehand({
  env: "LOCAL",
  modelName: `ollama/${model}`,
  modelBaseUrl: "http://localhost:11434/v1",
  modelClientOptions: { apiKey: "ollama" },
  headless: true,
  verbose: 0,
});

await stagehand.init();
const page = stagehand.context.pages()[0] ?? await stagehand.context.newPage();

console.log("📌 Hacker Newsにアクセス中...");
await page.goto("https://news.ycombinator.com", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1500);

// Playwrightで確実にタイトル取得
const titles = await page.evaluate(() =>
  [...document.querySelectorAll('.titleline > a')]
    .slice(0, 5)
    .map(a => a.textContent.trim())
);

console.log("\n✅ 取得したタイトル:");
titles.forEach((t, i) => console.log(`  ${i + 1}. ${t}`));

// Stagehand observeでAI要素検出
console.log("\n🔍 Stagehand observe（AI要素検出）:");
try {
  const obs = await stagehand.observe({ instruction: "Find the search or login button" });
  console.log(" →", obs?.[0]?.description ?? "なし");
} catch (e) {
  console.log(" → observe:", e.message.slice(0, 80));
}

await stagehand.close();
console.log("\n✅ 完了！");
