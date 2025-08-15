<script>
async function publish() {
  const title = document.getElementById('title').value.trim();
  const content = document.getElementById('content').value.trim();

  if (!title || !content) {
    alert('Title and content required');
    return;
  }

  try {
    const res = await fetch('/api/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content })
    });

    const data = await res.json();
    if (!res.ok) {
      alert('Failed: ' + (data.error || 'Unknown error'));
      return;
    }

    alert('✅ Post published!');
    window.location.href = '/blog.html';
  } catch (err) {
    alert('Error: ' + err.message);
  }
}
</script>
