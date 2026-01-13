import { login } from "./auth/login.js";
import { me } from "./auth/me.js";
import { logout } from "./auth/logout.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;
    const method = request.method;

    // 只处理 /api/*
    if (!pathname.startsWith("/api/")) {
      return new Response("Not Found", { status: 404 });
    }

    // ---- LOGIN ----
    if (pathname === "/api/login") {
      if (method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
      }
      return login(request, env);
    }

    // ---- ME ----
    if (pathname === "/api/me") {
      if (method !== "GET") {
        return new Response("Method Not Allowed", { status: 405 });
      }
      return me(request, env);
    }

    // ---- LOGOUT ----
    if (pathname === "/api/logout") {
      if (method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
      }
      return logout(request, env);
    }

    // ---- UNKNOWN API ----
    return new Response("Not Found", { status: 404 });
  }
};
