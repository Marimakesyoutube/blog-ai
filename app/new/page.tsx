"use client";
import { useState } from "react";

export default function New() {
  const [topic, setTopic] = useState("Give me a compact post about quiet growth using automation.");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg(null);

    const r = await fetch("/api/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ topic })
    });
    const data = await r.json();
    setLoading(false);
    if (r.ok) setMsg("Generated ✓");
    else setMsg("Error: " + (data?.error || r.statusText));
  }

  return (
    <main className="container">
      <h2>New Post</h2>
      <form onSubmit={generate} className="card">
        <label>Topic</label>
        <textarea rows={6} value={topic} onChange={e=>setTopic(e.target.value)} />
        <button className="btn" disabled={loading}>{loading ? "Generating…" : "Generate & Save"}</button>
      </form>
      {msg && <p>{msg}</p>}
    </main>
  );
}
