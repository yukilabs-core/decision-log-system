#!/bin/bash

# gopass から環境変数を取得して .env.local を生成

SERVICE_ROLE_KEY=$(gopass show "yukilabs/supabase/decision-log-system/service-role-key")

if [ -z "$SERVICE_ROLE_KEY" ]; then
  echo "Error: Service role key not found in gopass"
  exit 1
fi

cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=https://sqadoipuruwvdbufzvqv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ALEWz9LR3o_PK-xzpcMl1Q_nUlgdDH_
SUPABASE_SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY

# Demo Mode (Local only)
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_DEMO_EMAIL=demo@example.com
NEXT_PUBLIC_DEMO_PASSWORD=Demo@123456
EOF

echo "✅ .env.local updated from gopass"
cat .env.local
