import { createContext, useContext, useState, type ReactNode } from "react";
import { setToken, clearToken, getToken } from "@/lib/api";

const SESSION_KEY = "mi_admin_session";
const EMAIL_KEY = "mi_admin_email";

type AuthUser = { email: string; role: "admin" };

type AuthContextValue = {
  user: AuthUser | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try { return localStorage.getItem(SESSION_KEY) === "1" && !!getToken(); } catch { return false; }
  });

  const user: AuthUser | null = isAdmin
    ? { email: localStorage.getItem(EMAIL_KEY) || "", role: "admin" }
    : null;

  const login = async (email: string, password: string) => {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error((data as any).error || "Invalid email or password.");
    }
    const data = await res.json() as { token: string; email: string };
    setToken(data.token);
    localStorage.setItem(SESSION_KEY, "1");
    localStorage.setItem(EMAIL_KEY, data.email);
    setIsAdmin(true);
  };

  const logout = () => {
    clearToken();
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(EMAIL_KEY);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading: false, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
