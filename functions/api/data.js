const JSON_HEADERS = { 'Content-Type': 'application/json' };

export async function onRequestGet({ env }) {
  const data = await env.HABITS.get('data');
  return new Response(data || 'null', {
    headers: { ...JSON_HEADERS, 'Cache-Control': 'no-store' }
  });
}

// Accept only the shape the app actually stores: { habits: [...], entries: {...} }.
// Rejects anything malformed so the store can never hold structured junk.
function validShape(obj) {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) return false;
  if (!Array.isArray(obj.habits)) return false;
  if (obj.entries === null || typeof obj.entries !== 'object' || Array.isArray(obj.entries)) return false;
  for (const h of obj.habits) {
    if (h === null || typeof h !== 'object' || Array.isArray(h)) return false;
    if (typeof h.id !== 'string') return false;
  }
  return true;
}

export async function onRequestPut({ request, env }) {
  const body = await request.text();

  if (body.length > 1_000_000) {
    return new Response('{"error":"too large"}', { status: 413, headers: JSON_HEADERS });
  }

  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    return new Response('{"error":"invalid json"}', { status: 400, headers: JSON_HEADERS });
  }

  if (!validShape(parsed)) {
    return new Response('{"error":"unexpected shape"}', { status: 422, headers: JSON_HEADERS });
  }

  await env.HABITS.put('data', JSON.stringify(parsed));
  return new Response('{"ok":true}', { headers: JSON_HEADERS });
}
