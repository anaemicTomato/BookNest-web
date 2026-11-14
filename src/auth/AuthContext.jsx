import { createContext, useContext, useState } from "react";
import { loginRequest } from "../api/auth";

const USER_KEY = "booknest_user";
const TOKEN_KEY = "booknest_token";

export const HOME = { member: "/member", staff: "/staff", admin: "/admin" };

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(USER_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  async function login(username, password) {
    const data = await loginRequest(username, password);
    localStorage.setItem(TOKEN_KEY, data.token);
    const u = { role: data.role, fullName: data.fullName };
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);