# Netlify デプロイメント手順

## 1. Supabase プロジェクト作成

1. [Supabase](https://supabase.com) にアクセス
2. 新規プロジェクト作成
3. プロジェクト設定から以下を取得：
   - `NEXT_PUBLIC_SUPABASE_URL`: Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon key

## 2. .env.local に設定

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
```

## 3. ローカルテスト

```bash
npm run dev
# http://localhost:3000 でアクセス確認
```

## 4. Netlify にデプロイ

### 方法A: Netlify UI（推奨）
1. [Netlify](https://netlify.com) にアクセス
2. GitHub アカウントで接続
3. "Add new site" → "Import an existing project"
4. `decision-log-system` リポジトリ選択
5. ビルド設定：
   - Build command: `npm run build`
   - Publish directory: `.next`

### 方法B: Netlify CLI
```bash
npm install -g netlify-cli
netlify deploy
```

## 5. 環境変数設定（Netlify Dashboard）

1. Site settings → Build & deploy → Environment
2. 環境変数を追加：
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```

## 6. デプロイ確認

- Netlify Dashboard で自動ビルド・デプロイが実行される
- https://your-site.netlify.app でアクセス可能
