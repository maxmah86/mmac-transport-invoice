/**
 * auth.js
 * 只做一件事：查询当前 session 状态
 * 不负责任何页面跳转
 */

export async function getCurrentUser() {
  try {
    const res = await fetch("/api/me", {
      credentials: "include"
    });

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch {
    return null;
  }
}

export async function logout() {
  try {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include"
    });
  } catch {
    // ignore
  }
}
