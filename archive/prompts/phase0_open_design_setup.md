# Phase 0: open-design 起動 & 設計システム登録

【タスク】open-design daemon を起動し、Sippomi の DESIGN.md を
          設計システムとして読み込ませる。後続の開発エージェントが
          open-design-landing スキルを使える状態にする。

【プロジェクトルート】/Users/shimizutaiga/Projects/sippomi/

【Step 1: Sippomi DESIGN.md を open-design に登録】

```bash
mkdir -p /Users/shimizutaiga/Projects/open-design/design-systems/sippomi
cp /Users/shimizutaiga/Projects/sippomi/DESIGN.md \
   /Users/shimizutaiga/Projects/open-design/design-systems/sippomi/DESIGN.md
```

登録した DESIGN.md の先頭を open-design 互換に編集:
- H1 を `# Sippomi — Apple Japan × MUJI Hybrid` に
- H1 直後に `> Category: Pet & Lifestyle` を追加

sed で実行:
```bash
cd /Users/shimizutaiga/Projects/open-design/design-systems/sippomi
# H1 を上書き（1行目）
sed -i '' '1s/.*/# Sippomi — Apple Japan × MUJI Hybrid/' DESIGN.md
# 2行目が空行なら Category 行を挿入
sed -i '' '2s/^$/> Category: Pet \& Lifestyle/' DESIGN.md
```

【Step 2: open-design daemon 起動】

```bash
/Users/shimizutaiga/.local/bin/open-design --port 7456 --no-open &
OD_PID=$!
echo "open-design daemon PID: $OD_PID"
sleep 3
curl -s http://127.0.0.1:7456/api/health && echo " daemon OK" || echo " daemon FAIL"
```

【Step 3: 設計システム選択】

```bash
export OD_DAEMON_URL=http://127.0.0.1:7456
# 設計システムを sippomi に設定
curl -s -X POST http://127.0.0.1:7456/api/design-system \
  -H "Content-Type: application/json" \
  -d '{"name": "sippomi"}'
```

【完了条件】
- open-design daemon がポート 7456 で起動中
- `curl http://127.0.0.1:7456/api/health` が 200 を返す
- `design-systems/sippomi/DESIGN.md` が存在する

【後続Phase向け情報】
- Daemon URL: `http://127.0.0.1:7456`
- 設計システム: `sippomi`
- 環境変数: `export OD_DAEMON_URL=http://127.0.0.1:7456`
