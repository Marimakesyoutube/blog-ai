
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Blog() {
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <main className="container">
      <h2>Blog</h2>
      {(!posts || posts.length === 0) && (
        <p className="muted">No posts yet. Generate one from <Link href="/new">/new</Link>.</p>
      )}
      {posts?.map((p: any) => (
        <div className="card" key={p.id}>
          <h3><Link href={`/post/${p.id}`}>{p.title || "Untitled"}</Link></h3>
          <p className="muted">{new Date(p.created_at).toLocaleString()}</p>
          <p>{(p.content || "").slice(0, 200)}...</p>
        </div>
      ))}
    </main>
  );
}
