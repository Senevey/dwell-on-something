// api/send.js

let config = {
  base: 'https://api.lumenverba.cc/v1',
  token: '',
  model_opus: 'claude-opus-4-6'
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string'
      ? JSON.parse(req.body)
      : (req.body || {});

    const text = String(body.text || '').trim();

    if (!text) {
      return res.status(400).json({ error: '缺少 text' });
    }

    // 从环境变量读取 Key；如果你已经在 Vercel 里配置了，就直接使用
    const token =
      process.env.LUMENVERBA_API_KEY ||
      config.token;

    if (!token) {
      return res.status(500).json({
        error: '没有配置 LumenVerba API Key'
      });
    }

    const base =
      process.env.LUMENVERBA_BASE ||
      config.base;

    const model =
      process.env.LUMENVERBA_MODEL ||
      config.model_opus ||
      'claude-opus-4-6';

    const response = await fetch(
      `${base.replace(/\/+$/, '')}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': token,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model,
          max_tokens: 4096,
          messages: [
            {
              role: 'user',
              content: text
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error || data
      });
    }

    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({
      error: err?.message || '服务器错误'
    });
  }
}
