// Cloudflare Pages Serverless Function for Cross-Device Real-time State Sync

interface Env {
  KOPIDESONDORO_KV?: {
    get: (key: string) => Promise<string | null>;
    put: (key: string, value: string) => Promise<void>;
  };
}

export const onRequestGet = async (context: { env: Env }) => {
  try {
    if (context.env?.KOPIDESONDORO_KV) {
      const data = await context.env.KOPIDESONDORO_KV.get('latest_state');
      if (data) {
        return new Response(data, {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-store',
          },
        });
      }
    }

    return new Response(JSON.stringify({ synced: false, message: 'No cloud state stored yet' }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'KV Error' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
};

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  try {
    const body = await context.request.text();
    if (context.env?.KOPIDESONDORO_KV && body) {
      await context.env.KOPIDESONDORO_KV.put('latest_state', body);
    }

    return new Response(JSON.stringify({ success: true, timestamp: Date.now() }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'KV Save Error' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
};

export const onRequestOptions = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
