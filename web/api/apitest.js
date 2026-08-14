export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      code: 'METHOD_NOT_ALLOWED',
      detail: '只接受 POST'
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

    if (!base || !token || !model) {
      return res.status(400).json({
        ok: false,
        code: 'MISSING_CONFIG',
        detail: '接口地址、令牌和模型名都要填写'
      });
    }

    let url;

    try {
      url = new URL('messages', base + '/').toString();
    } catch (error) {
      return res.status(200).json({
        ok: false,
        code: 'BAD_URL',
        detail: `${error.name}: ${error.message}`,
        base
      });
    }

    let response;

    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': token,
          Authorization: `Bearer ${token}`,
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
    } catch (error) {
      return res.status(200).json({
        ok: false,
        code: 'UPSTREAM_FETCH_FAILED',
        detail: `${error.name}: ${error.message}`,
        url
      });
    }

    const text = await response.text();

    let data = null;

    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }

    if (!response.ok) {
      return res.status(200).json({
        ok: false,
        code: response.status,
        detail:
          data?.error?.message ||
          data?.message ||
          text.slice(0, 1000) ||
          '中转站返回错误',
        url
      });
    }

    return res.status(200).json({
      ok: true,
      code: response.status,
      model: data?.model || model,
      url
    });
  } catch (error) {
    return res.status(200).json({
      ok: false,
      code: 'HANDLER_FAILED',
      detail: `${error?.name || 'Error'}: ${error?.message || String(error)}`
    });
  }
}
