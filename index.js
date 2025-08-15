import { useState } from "react";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState("");

  async function handleGenerate() {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
    });
    const data = await res.json();
    setResult(data.text);
  }

  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h1>✍️ MyDraftly AI Blog Generator</h1>
      <input
        style={{ padding: 10, width: "60%" }}
        placeholder="Enter a blog topic..."
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />
      <button style={{ marginLeft: 10, padding: 10 }} onClick={handleGenerate}>
        Generate
      </button>
      <div style={{ marginTop: 20, whiteSpace: "pre-wrap" }}>{result}</div>
    </div>
  );
}