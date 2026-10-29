// Cloudflare Pages Function — sincronización entre dispositivos
// Requiere un KV namespace enlazado como binding: MEDISTOCK_KV

const KEY = "farmacia-data";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  if (!env.MEDISTOCK_KV) {
    return new Response(
      JSON.stringify({ error: "KV no configurado", localOnly: true }),
      { status: 503, headers: cors }
    );
  }

  try {
    if (request.method === "GET") {
      const raw = await env.MEDISTOCK_KV.get(KEY);
      const data = raw ? JSON.parse(raw) : null;
      return new Response(JSON.stringify(data), { status: 200, headers: cors });
    }

    if (request.method === "POST") {
      const body = await request.json();
      if (!body || typeof body !== "object") {
        return new Response(JSON.stringify({ error: "Invalid body" }), {
          status: 400,
          headers: cors,
        });
      }
      body.syncedAt = new Date().toISOString();
      await env.MEDISTOCK_KV.put(KEY, JSON.stringify(body));
      return new Response(
        JSON.stringify({ ok: true, syncedAt: body.syncedAt }),
        { status: 200, headers: cors }
      );
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: cors,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err.message || err) }),
      { status: 500, headers: cors }
    );
  }
}
