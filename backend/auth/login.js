/**
 * login.js
 * - 使用 user 登录
 * - Session 存 DB
 * - Cookie 明确 SameSite=Lax，解决无痕模式丢失
 */

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function login(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { user, password } = body || {};

  if (!user || !password) {
    return new Response("Missing credentials", { status: 400 });
  }

  // 查用户
  const record = await env.DB.prepare(
    "SELECT * FROM users WHERE user = ?"
  ).bind(user).first();

  if (!record) {
    return new Response("Invalid user or password", { status: 401 });
  }

  // 计算密码 hash
  const enc = new TextEncoder().encode(password);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  const hash = btoa(String.fromCharCode(...new Uint8Array(buf)));

  if (!safeEqual(hash, record.password_hash)) {
    return new Response("Invalid user or password", { status: 401 });
  }

  // 清理旧 session（保持你之前的安全策略）
  await env.DB.prepare(
    "DELETE FROM sessions WHERE user_id = ?"
  ).bind(record.id).run();

  // 创建新 session
  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await env.DB.prepare(
    `INSERT INTO sessions (user_id, session_token, expires_at)
     VALUES (?, ?, ?)`
  ).bind(record.id, token, expires.toISOString()).run();

  // HTTPS 才加 Secure
  const isHttps = request.headers.get("x-forwarded-proto") === "https";

  // ★ 关键修复点：SameSite=Lax
  const cookie =
    `mmac_session=${token}; ` +
    `HttpOnly; ` +
    `Path=/; ` +
    `Max-Age=604800; ` +
    `SameSite=Lax` +
    (isHttps ? `; Secure` : ``);

  return new Response(
    JSON.stringify({ success: true }),
    {
      headers: {
        "Set-Cookie": cookie,
        "Content-Type": "application/json"
      }
    }
  );
}
