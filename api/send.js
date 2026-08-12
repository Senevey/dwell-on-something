export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key = process.env.LUMENVERBA_API_KEY;
  if (!key) {
    return res.status(500).json({ error: 'Missing LUMENVERBA_API_KEY' });
  }

  try {
    const body =
      typeof req.body === 'string'
        ? JSON.parse(req.body)
        : (req.body || {});

    const text = String(body.text || '').trim();

    if (!text) {
      return res.status(400).json({ error: 'text is required' });
    }

    const model =
      body.model ||
      process.env.LUMENVERBA_MODEL ||
      'claude-opus-4-6';

    const response = await fetch(
      'https://lumenverba.cc/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'user',
              content: text
            }
          ],
          stream: false
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error || data
      });
    }

    const content = data?.choices?.[0]?.message?.content;

    if (typeof content !== 'string') {
      return res.status(502).json({
        error: 'Unexpected LumenVerba response',
        raw: data
      });
    }

    return res.status(200).json({
      text: content,
      model: data?.model || model,
      usage: data?.usage || null
    });

  } catch (e) {
    return res.status(500).json({
      error: e?.message || String(e)
    });
  }
}
