export async function me(request, env) {
  const cookie = request.headers.get("Cookie") || "";
  const token = cookie.match(/mmac_session=([^;]+)/)?.[1];

  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  const user = await env.DB.prepare(
    `SELECT users.id, users.user, users.role
     FROM sessions
     JOIN users ON users.id = sessions.user_id
     WHERE sessions.session_token = ?
       AND sessions.expires_at > datetime('now')`
  ).bind(token).first();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  return new Response(JSON.stringify(user), {
    headers: { "Content-Type": "application/json" }
  });
}
