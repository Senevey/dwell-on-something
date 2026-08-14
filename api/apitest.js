export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      code: 'METHOD_NOT_ALLOWED'
    });
  }

  try {
    const body =
      typeof req.body === 'string'
        ? JSON.parse(req.body)
        : (req.body || {});

    const base = String(body.base || '').trim().replace(/\/+$/, '');
    const token = String(body.token || '').trim();
    const model = String(body.model_opus || '').trim();

    if (!base) {
      return res.status(400).json({
        ok: false,
        code: 'NO_BASE',
        detail: '没有填写接口地址'
      });
    }

    if (!token) {
      return res.status(400).json({
        ok: false,
        code: 'NO_TOKEN',
        detail: '没有填写令牌'
      });
    }

    if (!model) {
      return res.status(400).json({
        ok: false,
        code: 'NO_MODEL',
        detail: '没有填写模型名'
      });
    }

    const url = `${base}/messages`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': token,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        max_tokens: 16,
        messages: [
          {
            role: 'user',
            content: 'Hi'
          }
        ]
      })
    });

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!response.ok) {
      return res.status(200).json({
        ok: false,
        code: response.status,
        detail:
          data?.error?.message ||
          data?.error ||
          data?.message ||
          text ||
          '接口返回错误',
        url
      });
    }

    return res.status(200).json({
      ok: true,
      model:
        data?.model ||
        model,
      url
    });

  } catch (e) {
    return res.status(200).json({
      ok: false,
      code: 'REQUEST_FAILED',
      detail: e?.message || '请求失败'
    });
  }
}
