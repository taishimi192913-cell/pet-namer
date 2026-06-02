"""GA4 トラフィック分析スクリプト v4"""
import argparse
import os
import pickle
import sys
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOKEN_PATH = os.path.join(BASE, "credentials", "saved-auth.json")

def parse_args():
    parser = argparse.ArgumentParser(description="Fetch Sippomi GA4 traffic reports.")
    parser.add_argument("--start", default="30daysAgo", help="GA4 startDate. Example: 2026-05-01 or 30daysAgo")
    parser.add_argument("--end", default="today", help="GA4 endDate. Example: 2026-05-31, yesterday, or today")
    parser.add_argument("--property", dest="property_id", default=None, help="GA4 property ID override")
    parser.add_argument("--limit", type=int, default=20, help="Rows per report")
    return parser.parse_args()


ARGS = parse_args()

if not os.path.exists(TOKEN_PATH):
    print("❌ 先に python3 scripts/ga4-auth.py を実行してください")
    sys.exit(1)

with open(TOKEN_PATH, "rb") as f:
    creds = pickle.load(f)

analytics = build("analyticsdata", "v1beta", credentials=creds)

# プロパティIDを検出
GA4_PROPERTY = None

# Admin APIでアカウント一覧を取得
try:
    admin = build("analyticsadmin", "v1beta", credentials=creds)
    accounts = admin.accountSummaries().list().execute()
    for summary in accounts.get("accountSummaries", []):
        for prop in summary.get("propertySummaries", []):
            name = prop.get("displayName", "")
            pid = prop.get("property", "").split("/")[-1]
            print(f"  発見: {name} → properties/{pid}")
            if not GA4_PROPERTY:
                GA4_PROPERTY = pid
except HttpError as e:
    print(f"  ⚠️ Admin API: {e}")

# 直接指定でも試す
FALLBACK = "399410905"

def run_report(metrics, dimensions=None, order_bys=None, limit=20, property_id=None):
    pid = property_id or ARGS.property_id or GA4_PROPERTY or FALLBACK
    req = {
        "metrics": metrics,
        "dateRanges": [
            {"startDate": ARGS.start, "endDate": ARGS.end},
        ],
        "limit": str(limit),
    }
    if dimensions:
        req["dimensions"] = dimensions
    if order_bys:
        req["orderBys"] = order_bys
    return analytics.properties().runReport(
        property=f"properties/{pid}", body=req
    ).execute()

def print_rows(report, labels):
    for row in report.get("rows", []):
        dims = [dv.get("value", "") for dv in row.get("dimensionValues", [])]
        metrics = [mv.get("value", "") for mv in row.get("metricValues", [])]
        parts = []
        for i, v in enumerate(dims):
            parts.append(f"{labels[i]}: {v}")
        for i, v in enumerate(metrics):
            parts.append(f"{labels[len(dims) + i]}: {v}")
        print("  " + " | ".join(parts))

def main():
    print("━" * 50)
    print(f"📊 GA4 トラフィックレポート (property={ARGS.property_id or GA4_PROPERTY or FALLBACK})")
    print(f"📅 期間: {ARGS.start}〜{ARGS.end}")
    print("━" * 50)

    # 全体サマリー
    print(f"\n📈 【全体サマリー（{ARGS.start}〜{ARGS.end}）】")
    try:
        r = run_report([
            {"name": "totalUsers"}, {"name": "sessions"}, {"name": "screenPageViews"},
            {"name": "bounceRate"}, {"name": "averageSessionDuration"}, {"name": "engagementRate"},
        ])
        for row in r.get("rows", []):
            d = row["metricValues"]
            print(f"  users: {d[0].get('value','-')}")
            print(f"  sessions: {d[1].get('value','-')}")
            print(f"  pageviews: {d[2].get('value','-')}")
            print(f"  bounceRate: {d[3].get('value','-')}")
            print(f"  avgDuration: {d[4].get('value','-')}s")
            print(f"  engagementRate: {d[5].get('value','-')}")
    except HttpError as e:
        print(f"  ❌ {e}")

    # 流入元
    print("\n🚪 【流入元】")
    try:
        r = run_report(
            [{"name": "sessions"}, {"name": "engagementRate"}],
            [{"name": "sessionDefaultChannelGrouping"}],
            [{"metric": {"metricName": "sessions"}, "desc": True}],
            limit=ARGS.limit,
        )
        print_rows(r, ["channel", "sessions", "engagement"])
    except HttpError as e:
        print(f"  ❌ {e}")

    # デバイス
    print("\n📱 【デバイス】")
    try:
        r = run_report(
            [{"name": "sessions"}],
            [{"name": "deviceCategory"}],
            [{"metric": {"metricName": "sessions"}, "desc": True}],
            limit=ARGS.limit,
        )
        print_rows(r, ["device", "sessions"])
    except HttpError as e:
        print(f"  ❌ {e}")

    # 地域
    print("\n🌍 【地域 TOP10】")
    try:
        r = run_report(
            [{"name": "sessions"}],
            [{"name": "region"}, {"name": "city"}],
            [{"metric": {"metricName": "sessions"}, "desc": True}],
            limit=min(ARGS.limit, 10),
        )
        print_rows(r, ["region", "city", "sessions"])
    except HttpError as e:
        print(f"  ❌ {e}")

    # ランディングページ
    print("\n🛬 【ランディングページ TOP20】")
    try:
        r = run_report(
            [{"name": "sessions"}, {"name": "bounceRate"}, {"name": "engagementRate"}],
            [{"name": "landingPage"}],
            [{"metric": {"metricName": "sessions"}, "desc": True}],
            limit=ARGS.limit,
        )
        print_rows(r, ["landing", "sessions", "bounce", "engage"])
    except HttpError as e:
        print(f"  ❌ {e}")

    # 人気ページ
    print("\n📄 【人気ページ TOP20】")
    try:
        r = run_report(
            [{"name": "screenPageViews"}, {"name": "bounceRate"}, {"name": "averageSessionDuration"}],
            [{"name": "pagePath"}],
            [{"metric": {"metricName": "screenPageViews"}, "desc": True}],
            limit=ARGS.limit,
        )
        print_rows(r, ["URL", "PV", "bounce", "duration"])
    except HttpError as e:
        print(f"  ❌ {e}")

    # 週次トレンド
    print("\n📅 【週次トレンド】")
    try:
        r = run_report(
            [{"name": "sessions"}],
            [{"name": "week"}],
            [{"dimension": {"dimensionName": "week"}}],
            limit=20,
        )
        print_rows(r, ["week", "sessions"])
    except HttpError as e:
        print(f"  ❌ {e}")

    print("\n✅ 完了")

if __name__ == "__main__":
    main()
