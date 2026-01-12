export async function logout(request, env) {
  const cookie = request.headers.get("Cookie") || "";
  const token = cookie.match(/mmac_session=([^;]+)/)?.[1];

  if (token) {
    await env.DB.prepare(
      "DELETE FROM sessions WHERE session_token = ?"
    ).bind(token).run();
  }

  return new Response(
    JSON.stringify({ success: true }),
    {
      headers: {
        "Set-Cookie": "mmac_session=; Max-Age=0; Path=/",
        "Content-Type": "application/json"
      }
    }
  );
}
