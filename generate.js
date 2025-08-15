export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { topic, tone = 'helpful and clear', length = '600–900 words', keywords = '' } = req.body || {};
    if (!topic) return res.status(400).json({ error: 'Missing topic' });

    const prompt = [
      `Write an original blog post in Markdown.`,
      `Topic: ${topic}`,
      `Tone: ${tone}`,
      `Length: ${length}`,
      keywords ? `Include these keywords naturally: ${keywords}` : '',
      `Use: A clear H1, short intro, H2/H3 subheads, bullets where useful, and a concise CTA.`
    ].filter(Boolean).join('\n');

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You write concise, helpful, SEO-aware blog posts in Markdown." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      })
    });

    if (!resp.ok) {
      const txt = await resp.text();
      return res.status(500).json({ error: `OpenAI error: ${txt.slice(0,400)}` });
    }
    const data = await resp.json();
    const md = data.choices?.[0]?.message?.content || "# Draft\n\n(Empty)";
    const firstLine = md.split('\n')[0].replace(/^#\s*/, '').trim();
    return res.status(200).json({ title: firstLine || topic, content: md });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}