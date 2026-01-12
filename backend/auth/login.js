export async function login(request, env) {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return new Response("Missing credentials", { status: 400 });
  }

  const user = await env.DB.prepare(
    "SELECT * FROM users WHERE email = ?"
  ).bind(email).first();

  if (!user) {
    return new Response("Invalid login", { status: 401 });
  }

  const enc = new TextEncoder().encode(password);
  const hashBuf = await crypto.subtle.digest("SHA-256", enc);
  const hash = btoa(String.fromCharCode(...new Uint8Array(hashBuf)));

  if (hash !== user.password_hash) {
    return new Response("Invalid login", { status: 401 });
  }

  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await env.DB.prepare(
    `INSERT INTO sessions (user_id, session_token, expires_at)
     VALUES (?, ?, ?)`
  ).bind(user.id, token, expires.toISOString()).run();

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
