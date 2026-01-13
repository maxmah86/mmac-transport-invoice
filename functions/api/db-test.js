export async function onRequest(context) {
  const { env } = context;

  try {
    // 尝试读 users 表（不会改任何数据）
    const result = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM users"
    ).first();

    return new Response(
      JSON.stringify({
        db: "connected",
        users_count: result.count
      }, null, 2),
      {
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({
        db: "error",
        message: e.message
      }, null, 2),
      { status: 500 }
    );
  }
}
