export async function requireAuth(request, env) {
  const cookie = request.headers.get("Cookie") || "";
  const token = cookie.match(/mmac_session=([^;]+)/)?.[1];

  if (!token) return null;

  const user = await env.DB.prepare(
    `SELECT users.id, users.user, users.role
     FROM sessions
     JOIN users ON users.id = sessions.user_id
     WHERE sessions.session_token = ?
       AND sessions.expires_at > datetime('now')`
  ).bind(token).first();

  return user || null;
}
