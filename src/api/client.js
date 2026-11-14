const TOKEN_KEY = "booknest_token";
const USER_KEY = "booknest_user";

export async function api(path, { method = "GET", body } = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  // The token expired or is no longer valid: log out and go back to the login page
  if (res.status === 401 && token) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.assign("/");
    throw new Error("Your session has expired. Please log in again.");
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message ?? "Something went wrong. Please try again.");
  return data;
}