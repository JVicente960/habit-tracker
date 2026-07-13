export async function onRequestGet({ env }) {
  const data = await env.HABITS.get('data');
  return new Response(data || 'null', {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
}

export async function onRequestPut({ request, env }) {
  const body = await request.text();
  if (body.length > 1_000_000) {
    return new Response('{"error":"too large"}', { status: 413 });
  }
  try { JSON.parse(body); } catch {
    return new Response('{"error":"invalid json"}', { status: 400 });
  }
  await env.HABITS.put('data', body);
  return new Response('{"ok":true}', {
    headers: { 'Content-Type': 'application/json' }
  });
}
