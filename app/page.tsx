import Image from "next/image";

export default function Home() {
  return (
    <main className="container">
      <div className="card" style={{display:'flex',alignItems:'center',gap:12}}>
        <Image src="/logo.svg" width={48} height={48} alt="logo" />
        <div>
          <h1 style={{margin:0}}>MyDraftly</h1>
          <p className="muted">Hands-free AI posts → stored in Supabase → optionally distributed via webhook.</p>
        </div>
      </div>
      <div className="card">
        <p><b>Quick Start</b></p>
        <ol>
          <li>Set env vars (OPENAI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY).</li>
          <li>In Supabase run <code>supabase/schema.sql</code> to create the <code>posts</code> table.</li>
          <li>Generate a post from <a href="/new">/new</a>.</li>
          <li>Open the <a href="/blog">Blog</a> page.</li>
        </ol>
      </div>
    </main>
  );
}
