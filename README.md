# SignalKite

SignalKite is a read-only portfolio intelligence companion for Zerodha Kite users. It connects through Kite OAuth, syncs holdings, computes technical signals, and shows BUY / SELL / HOLD context in a React Native app.

## Structure

```text
backend/  FastAPI, SQLAlchemy, Alembic, Kite SDK, APScheduler
mobile/   Expo React Native app with portfolio, analysis, signals, picks, alerts
```

## Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
alembic upgrade head
uvicorn main:app --reload
```

For local one-command services:

```bash
docker compose up -d postgres redis
```

Required environment variables:

```text
KITE_API_KEY=
KITE_API_SECRET=
KITE_REDIRECT_URL=http://localhost:8000/auth/kite/callback
DATABASE_URL=postgresql+psycopg2://user:pass@localhost:5432/signalkite
REDIS_URL=redis://localhost:6379
FCM_SERVER_KEY=
JWT_SECRET=
CORS_ORIGINS=http://localhost:8081,http://127.0.0.1:8081
SCHEDULER_ENABLED=true
DB_AUTO_CREATE=false
```

Use `DB_AUTO_CREATE=true` only for SQLite/local development. For PostgreSQL environments, run Alembic migrations.

## Mobile Setup

```bash
cd mobile
npm install
npm run start
```

From the repository root, these helper scripts are available:

```bash
npm start
npm run backend
npm run backend:dev
npm run backend:migrate
npm run backend:test
npm run mailer
npm run worker
npm run mobile:typecheck
```

Operational endpoints:

```text
GET /health   Cheap liveness check
GET /ready    Database/config/dependency readiness check
GET /version  Service metadata for releases and support
```

Set `EXPO_PUBLIC_API_URL` when running on a physical device because `localhost` points to the phone, not your workstation.

```bash
$env:EXPO_PUBLIC_API_URL="http://YOUR_LAN_IP:8000"
npm run start
```

## Current Implementation

- Kite OAuth login and callback token storage.
- Holdings sync through the Kite SDK.
- APScheduler holdings refresh every 5 minutes.
- Signal engine using RSI, MACD histogram cross, Bollinger Bands, and EMA 9/21 cross.
- REST endpoints for portfolio, summary, signals, signal history, stock analysis, and top picks.
- Wealth endpoints for multi-portfolio scaffolding, watchlists, price alerts, dividends, FIFO capital gains, goals, read-only sharing, and import contracts.
- Expo app with navigation, portfolio screen, stock analysis, signals feed, top picks, and alert settings.
- Yahoo chart-data fallback for historical candles and Screener fundamentals enrichment.

## Product Feature Matrix

| Capability | Status |
| --- | --- |
| Real-time prices and P&L | Zerodha sync implemented; streaming ticks pending |
| Multiple portfolios | API/model implemented |
| Watchlist up to 50 tickers | API/model implemented; UI hub count added |
| Dividend tracking | API/model implemented |
| AI trade import | API contract implemented; provider integration pending |
| CSV import/export | API contract implemented; parser pending |
| Broker sync | Zerodha implemented |
| Multi-channel alerts | API/model implemented; delivery providers pending |
| Price targets and stop losses | API/model implemented |
| Performance and allocation dashboard | Wealth dashboard implemented |
| Capital gains tax report | FIFO API implemented |
| AI insights | Contract planned; model/provider pending |
| Security | CORS hardened; JWT/2FA pending |
| Read-only sharing | Token model/API implemented |
| Goals and projections | API/model implemented |
| Multi-currency | Base currency model implemented; FX provider pending |
| Research tools | Screener fundamentals and candles implemented |

## Next Production Steps

- Replace the legacy FCM server key call with Firebase Admin credentials for production push notifications.
- Add linting and migration dry-run checks to CI.
- Move long-running market scans into a persisted background job with stale-while-revalidate cache semantics.
- Add role-based sharing permissions around read-only portfolio links.

## Your Production Lane

Selected stack:

- AI: Ollama (`OLLAMA_BASE_URL`, `OLLAMA_MODEL`)
- Alerts: Telegram first
- Database: PostgreSQL
- Hosting: Render
- Android build: APK first through EAS preview profile
- Tax: India FIFO capital-gains estimate
- CSV: Zerodha-style CSV headers plus generic fallback

### Telegram Credentials

1. Open Telegram and search for `@BotFather`.
2. Send `/newbot`.
3. Follow the prompts and copy the bot token into:

```env
TELEGRAM_BOT_TOKEN=123456:abc...
```

4. Send any message to your new bot.
5. Open this URL in a browser, replacing the token:

```text
https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getUpdates
```

6. Find `chat.id` in the JSON and put it in:

```env
TELEGRAM_CHAT_ID=123456789
```

### Email Alerts with Nodemailer

SignalKite sends email through a small local Node service in `notification-gateway/`.

```bash
cd notification-gateway
npm install
copy .env.example .env
npm run start
```

For Gmail, use an app password instead of your normal account password:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM=SignalKite <your-email@gmail.com>
```

After starting the gateway, verify the SMTP login without sending an email:

```bash
curl http://127.0.0.1:8787/verify-smtp
```

Then point the backend to the gateway:

```env
EMAIL_WEBHOOK_URL=http://127.0.0.1:8787/send-email
ALERT_EMAIL_TO=your-email@gmail.com
```

### SMS Alerts with Textlocal

Create a Textlocal account, generate an API key, and use an approved sender ID:

```env
TEXTLOCAL_API_KEY=your_textlocal_api_key
TEXTLOCAL_SENDER=TXTLCL
ALERT_PHONE_TO=917000000000
```

For India, Textlocal usually expects the mobile number with country code, for example `91` plus the 10-digit number.

### Ollama

Install and run Ollama locally:

```bash
ollama pull llama3.1
ollama serve
```

For Render production, set `OLLAMA_BASE_URL` to a reachable Ollama server. Render's normal web services are not ideal for running a local Ollama model beside FastAPI; use a separate VM/GPU host or hosted Ollama-compatible endpoint.

### Render

This repo includes `render.yaml`. In Render:

1. New Blueprint
2. Connect this repository
3. Fill secret env vars: `KITE_API_KEY`, `KITE_API_SECRET`, `KITE_REDIRECT_URL`, `CORS_ORIGINS`, Telegram vars, `EMAIL_WEBHOOK_URL`, `ALERT_EMAIL_TO`, Textlocal vars, mailer SMTP vars, and `OLLAMA_BASE_URL`
4. Use the generated PostgreSQL database URL from the blueprint

### Android APK

From `mobile/`:

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

The `preview` profile is configured to produce an APK.

### iOS Build

iOS does not use APK files. For iPhone installation, build an IPA through EAS with an Apple Developer account:

```bash
cd mobile
eas build -p ios --profile preview
```

For an iOS Simulator build:

```bash
cd mobile
eas build -p ios --profile simulator
```
