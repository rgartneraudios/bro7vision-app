export default {
  async fetch(request, env) {

    // CORS — permite llamadas desde tu app
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const { system, messages, userMessage, iaMode } = await request.json();

    const apiKey = iaMode === 'admin'
      ? env.MISTRAL_ADMIN_KEY
      : env.MISTRAL_PUBLIC_KEY;

    const historial = [
      { role: 'system', content: system },
      ...messages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
      { role: 'user', content: userMessage },
    ];

    const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: historial,
        max_tokens: 300,
      }),
    });

    const data = await res.json();
    const texto = data?.choices?.[0]?.message?.content || '...';
    const uso = data?.usage || {};

    return new Response(JSON.stringify({ texto, uso }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  },
};