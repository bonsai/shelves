# セットアップ手順（opencode 向け）

## 1. 環境変数を準備

```bash
cp .env.local.example .env.local
# .env.local を開いて各キーを埋める（下記参照）
```

## 2. Neon Postgres

1. https://console.neon.tech → New Project（無料）
2. Connection string をコピー → `DATABASE_URL` にセット
3. DBテーブル作成：

```bash
npm run db:push
```

## 3. Clerk

1. https://dashboard.clerk.com → Create Application
2. Google ログインを有効化
3. `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` をセット
4. Webhooks → Add Endpoint
   - URL: `https://<your-vercel-url>/api/webhooks/clerk`
   - Events: `user.created`, `user.updated`
   - Signing Secret → `CLERK_WEBHOOK_SECRET` にセット

## 4. Stripe

1. https://dashboard.stripe.com
2. Products → ¥980/月のサブスク商品を作成 → Price ID → `STRIPE_PRO_PRICE_ID`
3. API Keys → `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
4. Webhooks → Add endpoint
   - URL: `https://<your-vercel-url>/api/webhooks/stripe`
   - Events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Signing secret → `STRIPE_WEBHOOK_SECRET`
5. Billing Portal → Settings で有効化（解約・カード変更用）

## 5. Vercel デプロイ

```bash
# Vercel CLI がある場合
vercel --prod

# または GitHub push → Vercel 自動デプロイ
```

Vercel Dashboard → Settings → Environment Variables に `.env.local` の全キーをコピー。

## 6. 動作確認チェックリスト

- [ ] `npm run dev` でローカル起動
- [ ] `/sign-up` でアカウント作成 → `/dashboard` にリダイレクト
- [ ] ダッシュボードでリスト作成 → `/<slug>` でボード表示
- [ ] 2つ目のリスト作成試行 → 403 エラー（無料制限）
- [ ] `/upgrade` → Stripe Checkout → 決済完了 → proプラン
- [ ] Stripe Webhook が届いて `users.plan` が `pro` になる

## API エンドポイント一覧

| Method | Path | 認証 | 説明 |
|--------|------|------|------|
| GET | `/api/boards` | 不要 | 公開ボード一覧 |
| POST | `/api/boards` | 任意 | ボード作成（free: 1件制限） |
| GET | `/api/boards/[slug]` | 不要 | ボード詳細+アイテム |
| POST | `/api/items` | 不要 | アイテム作成 |
| PATCH | `/api/items/[id]` | 不要 | アイテム更新 |
| DELETE | `/api/items/[id]` | 不要 | アイテム削除 |
| POST | `/api/stripe/checkout` | 必要 | Checkoutセッション作成 |
| POST | `/api/stripe/portal` | 必要 | Billing Portal |
| POST | `/api/webhooks/clerk` | Svix署名 | ユーザー同期 |
| POST | `/api/webhooks/stripe` | Stripe署名 | プラン更新 |
