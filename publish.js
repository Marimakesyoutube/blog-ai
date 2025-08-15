export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { title, content } = req.body || {};
  if (!title || !content) return res.status(400).json({ error: 'Missing title/content' });

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY; // server secret
  try {
    const resp = await fetch(`${url}/rest/v1/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ title, content, slug })
    });
    const data = await resp.json();
    if (!resp.ok) return res.status(resp.status).json({ error: data?.message || 'Insert failed' });
    return res.status(200).json(data[0]);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}