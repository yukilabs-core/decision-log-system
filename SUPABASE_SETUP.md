# Supabase セットアップ手順

## 1. Supabase プロジェクト作成

1. [Supabase](https://supabase.com) にアクセス
2. "New Project" をクリック
3. 必要情報を入力：
   - Project name: `decision-log-system` など
   - Database password: 安全なパスワードを設定
   - Region: 近い地域を選択

## 2. SQL スクリプト実行

### 方法A: Supabase Dashboard SQL Editor（推奨）

1. Supabase Dashboard にログイン
2. 左メニュー → "SQL Editor"
3. "New Query" をクリック
4. `supabase/migrations/001_create_tables.sql` の内容をコピーペースト
5. "Run" をクリック

### 方法B: Supabase CLI
```bash
supabase db push
```

## 3. 環境変数取得

1. Supabase Dashboard → Project Settings
2. API セクションで：
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon (public) key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. これらを `.env.local` にコピー

## 4. CORS 設定（重要）

1. Project Settings → CORS
2. 許可するオリジンを追加：
   - ローカル: `http://localhost:3000`
   - Netlify: `https://your-site.netlify.app`

## 5. テーブル作成確認

1. SQL Editor で以下を実行してテーブル一覧を確認：
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

2. 以下が表示されることを確認：
   - `decision_logs`
   - `decision_reviews`

## 6. RLS ポリシー確認

1. SQL Editor で以下を実行：
   ```sql
   SELECT * FROM pg_policies 
   WHERE schemaname = 'public';
   ```

2. 4 つのポリシーが表示されることを確認

## トラブルシューティング

### エラー: "relation decision_logs does not exist"
→ SQL スクリプトが正しく実行されていません。Step 2 を再実行してください。

### エラー: "permission denied for schema public"
→ Supabase ユーザーの権限が不足しています。プロジェクトの再作成が必要な場合があります。

## 次のステップ
- `.env.local` に環境変数を設定
- ローカルで `npm run dev` してテスト
- Netlify にデプロイ
