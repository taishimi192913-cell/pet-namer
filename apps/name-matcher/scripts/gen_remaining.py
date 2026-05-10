#!/usr/bin/env python3
"""Generate remaining 2 iOS app assets using gptimage2.0."""
import base64, json, sys, time
from datetime import datetime
from pathlib import Path
from urllib import request, error

ENV_PATH = Path("/Users/shimizutaiga/Projects/content/meetjapan_videos/anko/.env")
API_KEY = ""
for line in ENV_PATH.read_text().splitlines():
    if line.startswith("OPENAI_API_KEY="):
        API_KEY = line.split("=", 1)[1].strip().strip('"').strip("'")
        break

OUTPUT_DIR = Path("/Users/shimizutaiga/Projects/sippomi/apps/ios/assets/images-generated")
DESIGN = "Japanese minimalist, cream #f4eede, warm amber #F9A66C, deep brown #3D2C2A. No text, no UI, no watermark."

ASSETS = [
    {
        "name": "card_bg_texture",
        "size": "1024x1024",
        "prompt": f"Create a subtle seamless tileable background texture. Japanese washi paper style, cream base with barely-visible warm beige marks. Extremely subtle, almost invisible. Seamless repeat. {DESIGN}",
    },
    {
        "name": "results_bg_gradient",
        "size": "1024x1536",
        "prompt": f"Create a soft atmospheric background. Warm amber circular glow in upper portion fading into cream. Subtle wavy organic lines below. Clean center area. {DESIGN}",
    },
]

for asset in ASSETS:
    name, size, prompt = asset["name"], asset["size"], asset["prompt"]
    payload = {
        "model": "gpt-5.5",
        "input": [{"role": "user", "content": [{"type": "input_text", "text": prompt.strip()}]}],
        "tools": [{"type": "image_generation", "model": "gpt-image-2", "action": "generate", "size": size, "quality": "high"}],
    }
    headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
    print(f"\nGenerating {name} ({size})...", flush=True)
    start = time.time()
    try:
        req = request.Request("https://api.openai.com/v1/responses", data=json.dumps(payload).encode(), headers=headers, method="POST")
        with request.urlopen(req, timeout=300) as resp:
            data = json.loads(resp.read().decode())
        image_b64 = None
        for out in data.get("output", []):
            if isinstance(out, dict) and out.get("type") == "image_generation_call" and out.get("result"):
                image_b64 = out["result"]
        if not image_b64:
            print("FAIL: no image", flush=True)
            continue
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        path = OUTPUT_DIR / f"{name}_{ts}.png"
        path.write_bytes(base64.b64decode(image_b64))
        print(f"DONE ({time.time()-start:.0f}s, {path.stat().st_size//1024} KB) → {path.name}", flush=True)
    except Exception as e:
        print(f"FAIL: {e}", flush=True)
