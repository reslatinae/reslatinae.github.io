// Latin Syntax Studio – key-holding proxy for the OpenAI Responses API (Cloudflare Worker).
//
// The web page sends exactly the JSON it would send to OpenAI, but to this Worker and without a key.
// The Worker checks that the request comes from the allowed website(s), applies two rate limits,
// adds the secret key and returns OpenAI's answer unchanged (same status code, same body), so the
// page's error handling keeps working. The key exists only here, as a Cloudflare secret.
//
// Configuration: wrangler.jsonc (vars + rate limits) and the secret OPENAI_API_KEY (see README.md).

const OPENAI_URL = 'https://api.openai.com/v1/responses';
const MAX_BODY_BYTES = 100000; // a 300-word exercise is ~5 KB; anything much larger is not from the page

const list = (s) => (s || '').split(',').map(x => x.trim()).filter(Boolean);

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowedOrigins = list(env.ALLOWED_ORIGINS);
    const originOk = allowedOrigins.includes(origin);

    const cors = {
      'Access-Control-Allow-Origin': originOk ? origin : (allowedOrigins[0] || ''),
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin'
    };
    const reply = (status, message, code) => new Response(JSON.stringify({ error: { message, code } }), {
      status, headers: { ...cors, 'Content-Type': 'application/json' }
    });

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return reply(405, 'Only POST is allowed', 'method_not_allowed');
    if (!originOk) return reply(403, 'This service only answers the Latin Syntax Studio website', 'origin_not_allowed');

    // Rate limits (Cloudflare's counters are approximate and per location; the OpenAI spend cap is the real backstop).
    // Whole networks can share one IP (a school), so the per-IP limit is generous.
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (env.LIMIT_PER_IP && !(await env.LIMIT_PER_IP.limit({ key: ip })).success) {
      return reply(429, 'Too many requests from your network. Please wait a minute and try again.', 'rate_limit_exceeded');
    }
    if (env.LIMIT_GLOBAL && !(await env.LIMIT_GLOBAL.limit({ key: 'all' })).success) {
      return reply(429, 'The service is busy right now. Please try again in a minute.', 'rate_limit_exceeded');
    }

    // Body checks: small, valid JSON, only the models we pay for.
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return reply(413, 'Request too large', 'request_too_large');
    let body;
    try { body = JSON.parse(raw); } catch (e) { return reply(400, 'Invalid JSON', 'invalid_json'); }
    const allowedModels = list(env.ALLOWED_MODELS);
    if (allowedModels.length && !allowedModels.includes(body.model)) return reply(400, 'Model not allowed: ' + body.model, 'model_not_allowed');
    if (!env.OPENAI_API_KEY) return reply(500, 'The service is not configured yet (missing OPENAI_API_KEY secret)', 'proxy_not_configured');

    const upstream = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + env.OPENAI_API_KEY, 'Content-Type': 'application/json' },
      body: raw
    });

    // Pass OpenAI's answer through untouched (streamed, not parsed), with the CORS headers added.
    const headers = new Headers(cors);
    headers.set('Content-Type', upstream.headers.get('Content-Type') || 'application/json');
    return new Response(upstream.body, { status: upstream.status, headers });
  }
};
