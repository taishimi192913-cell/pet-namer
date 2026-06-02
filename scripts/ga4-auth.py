"""GA4 OAuth2 認証スクリプト
初回実行時にブラウザが開き、Googleアカウントで認証します。
認証後はトークンが saved-auth.json に保存され、次回から自動で使われます。

使い方:
1. credentials/oauth-client.json を配置
2. python3 scripts/ga4-auth.py
3. ブラウザで taiga.agent0123@gmail.com を選択して許可
"""
import os
import sys

from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import pickle

SCOPES = [
    "https://www.googleapis.com/auth/analytics.readonly",
    "https://www.googleapis.com/auth/analytics.edit",
    "https://www.googleapis.com/auth/analytics",
]
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CLIENT_SECRETS = os.path.join(BASE, "credentials", "oauth-client.json")
TOKEN_FILE = os.path.join(BASE, "credentials", "saved-auth.json")

def main():
    if not os.path.exists(CLIENT_SECRETS):
        print(f"\n❌ OAuthクライアントJSONが見つかりません: {CLIENT_SECRETS}")
        print("   GCPコンソールからダウンロードして credentials/oauth-client.json に配置してください")
        print("   https://console.cloud.google.com/apis/credentials?project=sippomi-analytics")
        sys.exit(1)

    creds = None

    # 保存されたトークンがあれば再利用
    if os.path.exists(TOKEN_FILE):
        with open(TOKEN_FILE, "rb") as f:
            creds = pickle.load(f)

    # トークンがない or 期限切れ → リフレッシュ or 再認証
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            print("🔄 トークンをリフレッシュ中...")
            creds.refresh(Request())
        else:
            print("\n🌐 ブラウザを開いてGoogle認証を行います...")
            flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRETS, SCOPES)
            creds = flow.run_local_server(
                port=0,
                open_browser=True,
                authorization_prompt_message="",
                success_message="✅ 認証成功！このウィンドウは閉じてOKです。",
            )

        # トークンを保存
        with open(TOKEN_FILE, "wb") as f:
            pickle.dump(creds, f)
        print(f"📝 トークンを {TOKEN_FILE} に保存しました")

    print("✅ 認証完了。GA4 Data APIが使えます。")
    print(f"   プロジェクト: {creds.project_id if hasattr(creds, 'project_id') else 'sippomi-analytics'}")


if __name__ == "__main__":
    main()
