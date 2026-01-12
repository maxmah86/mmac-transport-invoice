import { login } from "./auth/login";
import { logout } from "./auth/logout";
import { me } from "./auth/me";
import { requireAuth } from "./auth/requireAuth";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/api/login") {
      return login(request, env);
    }

    if (request.method === "POST" && url.pathname === "/api/logout") {
      return logout(request, env);
    }

    if (request.method === "GET" && url.pathname === "/api/me") {
      return me(request, env);
    }

    // ===== Protected APIs =====
    const user = await requireAuth(request, env);
    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    if (url.pathname === "/api/ping") {
      return new Response(
        JSON.stringify({ ok: true, user }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response("Not Found", { status: 404 });
  }
};
