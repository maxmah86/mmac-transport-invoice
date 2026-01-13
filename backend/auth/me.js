/**
 * me.js
 * - 返回当前登录用户
 * - 严格区分 session 状态，方便 debug
 */

export async function me(request, env) {
  // 1️⃣ 读取 cookie
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(/mmac_session=([^;]+)/);

  if (!match) {
    return new Response("Unauthorized", { status: 401 });
  }

  const token = match[1];

  // 2️⃣ 查 session
  const session = await env.DB.prepare(
    `
    SELECT
      s.id,
      s.user_id,
      s.expires_at,
      u.user,
      u.role
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.session_token = ?
    `
  ).bind(token).first();

  if (!session) {
    return new Response("Invalid session", { status: 401 });
  }

  // 3️⃣ 检查过期
  const now = Date.now();
  const expires = Date.parse(session.expires_at);

  if (isNaN(expires) || expires < now) {
    // 清理过期 session（可选但推荐）
    await env.DB.prepare(
      "DELETE FROM sessions WHERE session_token = ?"
    ).bind(token).run();

    return new Response("Session expired", { status: 401 });
  }

  // 4️⃣ 正常返回用户
  return new Response(
    JSON.stringify({
      id: session.user_id,
      user: session.user,
      role: session.role
    }),
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
}
