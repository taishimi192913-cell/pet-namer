/**
 * Stagehand + Ollama（完全ローカル・無料）デモ
 * OpenAI互換APIをOllamaが提供するので接続可能
 */
import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";

async function main() {
  console.log("🦙 Stagehand + Ollama（ローカルLLM）起動中...");

  const stagehand = new Stagehand({
    env: "LOCAL",
    modelName: "ollama/qwen2.5:7b",
    modelBaseUrl: "http://localhost:11434/v1",
    modelClientOptions: {
      apiKey: "ollama", // Ollamaはキー不要だがダミーが必要
    },
    headless: true,
    verbose: 0,
  });

  await stagehand.init();
  const context = stagehand.context;
  const pages = context.pages();
  const page = pages.length > 0 ? pages[0] : await context.newPage();

  console.log("📌 ページにアクセス中...");
  await page.goto("https://news.ycombinator.com", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);

  console.log("🔍 Ollama で要素を観察中...");
  try {
    const elements = await stagehand.observe({
      instruction: "Find the main story links on this page",
    });
    console.log("✅ observe成功:", elements?.[0]?.description ?? "なし");
  } catch (e) {
    console.log("observe:", e.message.slice(0, 100));
  }

  await stagehand.close();
  console.log("✅ Ollama + Stagehand デモ完了");
}

main().catch(e => console.error("❌", e.message));
