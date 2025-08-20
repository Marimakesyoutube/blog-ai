# Copy to .env.local (local dev) or set in Vercel Project → Settings → Environment Variables

OPENAI_API_KEY=sk-...

import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
