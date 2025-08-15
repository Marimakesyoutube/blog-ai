# MyDraftly — Supabase Blog Version
Full loop: Generate with AI → Publish to Supabase → List on /blog.html

## Files (put at repo root)
- `index.html` — AI writer + Publish
- `blog.html` — shows posts from Supabase
- `styles.css` — styles
- `api/generate.js` — serverless: calls OpenAI (needs `OPENAI_API_KEY`)
- `api/publish.js` — serverless: inserts into Supabase (needs `SUPABASE_SERVICE_ROLE_KEY`)

## Vercel env vars (Project → Settings → Environment Variables)
- `OPENAI_API_KEY` = your OpenAI key
- `NEXT_PUBLIC_SUPABASE_URL` = https://YOUR_PROJECT.supabase.co
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
- `SUPABASE_SERVICE_ROLE_KEY` = your service_role key (server-only)

## Supabase table (posts)
Columns:
- id: uuid, primary key, default gen_random_uuid(), not null
- title: text, not null
- content: text, not null
- slug: text, not null, unique
- created_at: timestamptz, default now(), not null
RLS ON. Policy: SELECT with USING: true

## How to deploy
1) Upload these files to your GitHub repo root.
2) Vercel will auto-deploy.
3) Open `/index.html` → Generate → Publish → check `/blog.html`.
