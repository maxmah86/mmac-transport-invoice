/**
 * auth.js
 * - 防止在无痕模式 / Cookie 丢失时出现 login <-> index 死循环
 * - 不改后端，不依赖 SameSite
 */

const API_BASE = ""; // 同域；若 API 子域再改

/**
 * 检查是否已登录
 * - 已登录：返回 user
 * - 未登录：仅在“非 login 页面”时跳转到 login.html
 */
export async function requireLogin() {
  const isLoginPage = location.pathname.endsWith("login.html");

  try {
    const res = await fetch(API_BASE + "/api/me", {
      credentials: "include"
    });

    if (!res.ok) {
      // 未登录：避免在 login.html 再次跳转导致死循环
      if (!isLoginPage) {
        location.replace("/login.html");
      }
      return null;
    }

    // 已登录
    return await res.json();

  } catch (e) {
    // 网络 / 路由异常：同样避免在 login.html 死循环
    if (!isLoginPage) {
      location.replace("/login.html");
    }
    return null;
  }
}

/**
 * 登出
 * - 清 session
 * - 强制回 login.html
 */
export async function logout() {
  try {
    await fetch(API_BASE + "/api/logout", {
      method: "POST",
      credentials: "include"
    });
  } finally {
    location.replace("/login.html");
  }
}
