-- decision_logs テーブル作成
CREATE TABLE decision_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 必須項目
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  background TEXT NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' NOT NULL,

  -- 選択肢 (JSON)
  choices JSONB NOT NULL,
  selected_choice_id UUID,

  -- 任意項目
  type VARCHAR(20),
  tags VARCHAR(50)[],
  constraints TEXT[],
  risks TEXT[],
  assumptions TEXT[],

  -- 振り返り情報
  outcome TEXT,
  learning TEXT[],
  next_actions TEXT[],

  -- メタデータ
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  reviewed_at TIMESTAMP
);

-- インデックス作成
CREATE INDEX idx_user_created ON decision_logs(user_id, created_at DESC);
CREATE INDEX idx_user_status ON decision_logs(user_id, status);
CREATE INDEX idx_user_tags ON decision_logs USING GIN(user_id, tags);
CREATE INDEX idx_title_text ON decision_logs USING GIN(to_tsvector('japanese', title));
CREATE INDEX idx_content_text ON decision_logs USING GIN(to_tsvector('japanese', content));

-- decision_reviews テーブル作成
CREATE TABLE decision_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_log_id UUID NOT NULL REFERENCES decision_logs(id) ON DELETE CASCADE,

  -- 振り返り内容
  outcome TEXT,
  learning TEXT[],

  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_review_log ON decision_reviews(decision_log_id);

-- RLS（Row-Level Security）を有効化
ALTER TABLE decision_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_reviews ENABLE ROW LEVEL SECURITY;

-- decision_logs の RLS ポリシー
CREATE POLICY "Users can view own decision logs"
ON decision_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own decision logs"
ON decision_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own decision logs"
ON decision_logs FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own decision logs"
ON decision_logs FOR DELETE
USING (auth.uid() = user_id);

-- decision_reviews の RLS ポリシー
CREATE POLICY "Users can view own reviews"
ON decision_reviews FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM decision_logs
    WHERE id = decision_reviews.decision_log_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert own reviews"
ON decision_reviews FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM decision_logs
    WHERE id = decision_log_id
    AND user_id = auth.uid()
  )
);
