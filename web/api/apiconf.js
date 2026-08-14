let config = {
  base: '',
  token: '',
  model_opus: ''
};

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      mode: config.base ? 'api' : 'subscription',
      base: config.base || '官方直连',
      models: {
        model_opus: config.model_opus || ''
      }
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string'
      ? JSON.parse(req.body)
      : (req.body || {});

    config = {
      base: String(body.base || '').trim(),
      token: String(body.token || '').trim(),
      model_opus: String(body.model_opus || '').trim()
    };

    return res.status(200).json({
      ok: true,
      mode: config.base ? 'api' : 'subscription',
      base: config.base || '官方直连',
      models: {
        model_opus: config.model_opus
      }
    });
  } catch (e) {
    return res.status(400).json({
      ok: false,
      error: 'Invalid JSON'
    });
  }
}
