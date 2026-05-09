#!/usr/bin/env python3
"""Generate Sippomi iOS app assets using gptimage2.0 (gpt-image-2 via OpenAI Responses API).

Uses gpt-5.5 as orchestrator → calls gpt-image-2 as a tool.
This is the CORRECT gptimage2.0 API pattern.
"""

import base64
import json
import os
import sys
import time
from datetime import datetime
from pathlib import Path
from urllib import request, error

# ── Config ──────────────────────────────────────────────────────────
ENV_PATH = Path("/Users/shimizutaiga/Projects/content/meetjapan_videos/anko/.env")
API_KEY = ""
if ENV_PATH.exists():
    for line in ENV_PATH.read_text().splitlines():
        if line.startswith("OPENAI_API_KEY="):
            API_KEY = line.split("=", 1)[1].strip().strip('"').strip("'")
            break

if not API_KEY:
    print("ERROR: Could not find OPENAI_API_KEY")
    sys.exit(1)

RESPONSES_URL = "https://api.openai.com/v1/responses"
ORCHESTRATOR_MODEL = "gpt-5.5"   # gptimage2.0 orchestrator
IMAGE_MODEL = "gpt-image-2"       # image generation tool
OUTPUT_DIR = Path("/Users/shimizutaiga/Projects/sippomi/apps/ios/assets/images-generated")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ── Sippomi Design Context ─────────────────────────────────────────
DESIGN = """
Design philosophy: Apple Japan product page × MUJI lifestyle magazine.
Colors: cream (#f4eede), warm amber (#F9A66C), deep brown (#3D2C2A), soft off-white (#FFF8F0).
Style: Japanese minimalist, warm, pet-friendly, clean organic shapes. No Material Design, no emojis.
Brand: "Sippomi" (シッポミ) — a pet name diagnosis app.
"""

# ── Image Prompts ──────────────────────────────────────────────────
ASSETS = [
    {
        "name": "splash_bg",
        "size": "1024x1536",
        "prompt": f"""Create a clean vertical splash-screen background for a Japanese pet name diagnosis app "Sippomi".

{DESIGN}

A gentle minimalist silhouette of a dog, a cat, and a rabbit sitting together in a warm circle. Pet silhouettes in deep brown (#3D2C2A). Behind them, a soft circular amber glow like a paper lantern. Cream (#f4eede) background fading softly at edges. Japanese minimalism, warm companionship, Apple-like cleanliness. Vertical 2:3 ratio with lots of breathing space for app title text overlay. Single full-frame image, no text, no UI, no watermark, no grid, no split screen.""",
    },
    {
        "name": "card_bg_texture",
        "size": "1024x1024",
        "prompt": f"""Create a subtle seamless tileable background texture for a Japanese pet name diagnosis app.

{DESIGN}

An extremely subtle, sophisticated abstract pattern suggesting soft paw prints, gentle wave ripples, and organic rounded shapes — barely visible, like Japanese washi paper texture. Seamless and tileable. MUJI minimalism — the pattern is so subtle it is almost invisible, just adding gentle warmth to flat card backgrounds. Cream (#f4eede) base with barely-there warm beige marks. No text, no UI, no watermark. Seamless repeat pattern.""",
    },
    {
        "name": "results_bg_gradient",
        "size": "1024x1536",
        "prompt": f"""Create a soft atmospheric background for a results screen of a Japanese pet name diagnosis app.

{DESIGN}

A very gentle background with a warm amber (#F9A66C) circular glow in the upper portion fading softly into cream (#f4eede). Below, extremely subtle wavy organic lines suggesting soft hills or fabric folds — almost abstract. Center and lower areas clean and open for text overlays. Japanese premium paper feel. Serene, warm, quietly elegant. No text, no UI, no watermark, no harsh gradients.""",
    },
]

# ── Generate (gptimage2.0 pattern) ─────────────────────────────────
def generate_image(name: str, size: str, prompt: str) -> Path | None:
    """Call gpt-image-2 via gpt-5.5 orchestrator (gptimage2.0 API pattern)."""
    image_tool = {
        "type": "image_generation",
        "model": IMAGE_MODEL,
        "action": "generate",
        "size": size,
        "quality": "high",
    }

    payload = {
        "model": ORCHESTRATOR_MODEL,
        "input": [
            {
                "role": "user",
                "content": [{"type": "input_text", "text": prompt.strip()}],
            }
        ],
        "tools": [image_tool],
    }

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }

    print(f"\n  Generating '{name}' ({size}) via {ORCHESTRATOR_MODEL}→{IMAGE_MODEL}...", end=" ", flush=True)
    start = time.time()

    try:
        req = request.Request(
            RESPONSES_URL,
            data=json.dumps(payload).encode("utf-8"),
            headers=headers,
            method="POST",
        )
        with request.urlopen(req, timeout=180) as resp:
            data = json.loads(resp.read().decode("utf-8"))

        # Extract base64 image from response output
        image_b64 = None
        for output in data.get("output", []):
            if isinstance(output, dict) and output.get("type") == "image_generation_call":
                result = output.get("result", "")
                if result:
                    image_b64 = result

        if not image_b64:
            print("FAILED — no image_generation_call result in response")
            return None

        # Save with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        out_path = OUTPUT_DIR / f"{name}_{timestamp}.png"
        out_path.write_bytes(base64.b64decode(image_b64))

        elapsed = time.time() - start
        size_kb = out_path.stat().st_size / 1024
        print(f"DONE ({elapsed:.1f}s, {size_kb:.0f} KB) → {out_path.name}")
        return out_path

    except error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")[:500]
        print(f"FAILED HTTP {e.code}: {body}")
        return None
    except Exception as e:
        print(f"FAILED: {e}")
        import traceback
        traceback.print_exc()
        return None


def main():
    print("=" * 60)
    print("  Sippomi iOS App — gptimage2.0 Asset Generator")
    print(f"  Orchestrator: {ORCHESTRATOR_MODEL}")
    print(f"  Image model:  {IMAGE_MODEL}")
    print(f"  Output:       {OUTPUT_DIR}")
    print("=" * 60)

    results = []
    for asset in ASSETS:
        path = generate_image(asset["name"], asset["size"], asset["prompt"])
        results.append({"name": asset["name"], "path": str(path) if path else None})

    print("\n" + "=" * 60)
    print("  Results:")
    for r in results:
        print(f"  {'✅' if r['path'] else '❌'} {r['name']}: {r['path'] or 'FAILED'}")

    manifest_path = OUTPUT_DIR / "manifest.json"
    manifest_path.write_text(json.dumps(results, indent=2, ensure_ascii=False) + "\n")
    print(f"\n  Manifest: {manifest_path}")
    print("=" * 60)

    success = [r for r in results if r["path"]]
    print(f"\n  Total: {len(success)}/{len(results)} generated successfully")
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
