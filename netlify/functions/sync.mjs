import { getStore } from "@netlify/blobs";

const STORE = "medistock";
const KEY = "farmacia-data";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  try {
    const store = getStore({ name: STORE, consistency: "strong" });

    if (req.method === "GET") {
      const data = await store.get(KEY, { type: "json" });
      return new Response(JSON.stringify(data || null), {
        status: 200,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST") {
      const body = await req.json();
      if (!body || typeof body !== "object") {
        return new Response(JSON.stringify({ error: "Invalid body" }), {
          status: 400,
          headers: { ...cors, "Content-Type": "application/json" },
        });
      }
      body.syncedAt = new Date().toISOString();
      await store.setJSON(KEY, body);
      return new Response(JSON.stringify({ ok: true, syncedAt: body.syncedAt }), {
        status: 200,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("sync error", err);
    return new Response(JSON.stringify({ error: String(err.message || err) }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
};

export const config = {
  path: "/api/sync",
};
