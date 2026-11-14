// Set to false once your API is ready
const USE_MOCK = false;

const FAKE_USERS = [
  { username: "maria", password: "maria123", role: "member", fullName: "Maria Santos" },
  { username: "ana", password: "ana123", role: "staff", fullName: "Ana Reyes" },
  { username: "carlo", password: "carlo123", role: "admin", fullName: "Carlo Mendoza" },
];

export async function loginRequest(username, password) {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 500)); // pretend the network takes a moment
    const user = FAKE_USERS.find((u) => u.username === username && u.password === password);
    if (!user) throw new Error("Wrong username or password. Check your details and try again.");
    return { token: "fake-token", role: user.role, fullName: user.fullName };
  }

  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message ?? "Something went wrong. Please try again.");
  return data; // { token, role, fullName }
}