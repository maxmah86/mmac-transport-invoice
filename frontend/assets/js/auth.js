const API_BASE = "";

export async function requireLogin() {
  try {
    const res = await fetch(API_BASE + "/api/me", {
      credentials: "include"
    });

    if (!res.ok) {
      location.href = "/login.html";
      return null;
    }

    return await res.json();
  } catch (e) {
    location.href = "/login.html";
    return null;
  }
}

export async function logout() {
  await fetch(API_BASE + "/api/logout", {
    method: "POST",
    credentials: "include"
  });

  location.href = "/login.html";
}
