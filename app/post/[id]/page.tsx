
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export default async function PostPage({ params }: { params: { id: string } }) {
  const { data: post } = await supabase.from("posts").select("*").eq("id", params.id).single();

  if (!post) return <main className="container"><p>Post not found.</p></main>;

  return (
    <main className="container">
      <h1>{post.title || "Untitled"}</h1>
      <p className="muted">{new Date(post.created_at).toLocaleString()}</p>
      <div className="card" style={{ whiteSpace: "pre-wrap" }}>{post.content}</div>
    </main>
  );
}
