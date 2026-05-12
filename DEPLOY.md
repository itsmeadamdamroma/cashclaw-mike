# Deploy CashClaw-Mike

## 1. Frontend → Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fitsmeadamdamroma%2Fcashclaw-mike)

**Configurazione Vercel:**
- **Framework Preset:** Next.js
- **Root Directory:** `frontend/`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

**Environment Variables (frontend):**
```
NEXT_PUBLIC_SUPABASE_URL=https://tuo-proj.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=tuo-anon-key
NEXT_PUBLIC_API_BASE_URL=https://tuo-backend.up.railway.app
```

## 2. Backend → Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https%3A%2F%2Fgithub.com%2Fitsmeadamdamroma%2Fcashclaw-mike)

**Environment Variables (backend):**
```
PORT=3001
SUPABASE_URL=https://tuo-proj.supabase.co
SUPABASE_SECRET_KEY=tuo-service-role-key
GEMINI_API_KEY=tua-gemini-key
R2_ENDPOINT_URL=https://account.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=mike
DOWNLOAD_SIGNING_SECRET=random-32-byte-hex
USER_API_KEYS_ENCRYPTION_SECRET=random-64-byte-hex
```

## 3. R2 Storage (Cloudflare)
Crea un bucket R2 su Cloudflare oppure usa MinIO self-hosted.

## Note
- Il backend usa Express + TypeScript — Railway lo builda e avvia automaticamente via `railway.json`
- Il frontend Next.js gira su Vercel serverless
- Document upload va al backend → R2 → URL firmata
