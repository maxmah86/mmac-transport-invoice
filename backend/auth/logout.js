export async function login(request, env) {
  const body = await request.json();
  const { user, password } = body;

  if (!user || !password) {
    return new Response("Missing credentials", { status: 400 });
  }

  const record = await env.DB.prepare(
    "SELECT * FROM users WHERE user = ?"
  ).bind(user).first();

  if (!record) {
    return new Response("Invalid user or password", { status: 401 });
  }

  // SHA-256 hash
  const enc = new TextEncoder().encode(password);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  const hash = btoa(String.fromCharCode(...new Uint8Array(buf)));

  if (hash !== record.password_hash) {
    return new Response("Invalid user or password", { status: 401 });
  }

  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await env.DB.prepare(
    `INSERT INTO sessions (user_id, session_token, expires_at)
     VALUES (?, ?, ?)`
  ).bind(record.id, token, expires.toISOString()).run();

  return new Response(
    JSON.stringify({ success: true }),
    {
      headers: {
        "Set-Cookie":
          `mmac_session=${token}; HttpOnly; Secure; Path=/; Max-Age=604800`,
        "Content-Type": "application/json"
      }
    }
  );
}
