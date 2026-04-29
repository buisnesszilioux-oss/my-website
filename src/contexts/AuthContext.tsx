import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const TOKEN_KEY = "mi_user_token";

export type UserRole = "admin" | "user";

export type AuthUser = {
  id: number;
  email: string;
  name: string;
  phone: string;
  company: string;
  picture: string;
  role: UserRole;
  provider: string;
  createdAt: string | null;
};

type RegisterData = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  company?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (data: RegisterData) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  updateProfile: (data: { name?: string; phone?: string; company?: string }) => Promise<AuthUser>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const realFetch = (input: any, init?: any) =>
  ((window as any).__realFetch__ || window.fetch).call(window, input, init);

async function api<T = any>(path: string, init: RequestInit = {}, token?: string | null): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await realFetch(path, { ...init, headers });
  const text = await res.text();
  let data: any = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { error: text }; }
  if (!res.ok || data?.error) {
    const err: any = new Error(data?.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.payload = data;
    throw err;
  }
  return data as T;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState<boolean>(true);

  // Keep localStorage in sync
  useEffect(() => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  }, [token]);

  // Boot: fetch /api/auth/me if we have a token
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) { setLoading(false); return; }
      try {
        const data = await api<{ user: AuthUser }>("/api/auth/me", { method: "GET" }, token);
        if (!cancelled) setUser(data.user);
      } catch {
        if (!cancelled) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = async () => {
    if (!token) { setUser(null); return; }
    try {
      const data = await api<{ user: AuthUser }>("/api/auth/me", { method: "GET" }, token);
      setUser(data.user);
    } catch {
      setToken(null);
      setUser(null);
    }
  };

  const login = async (email: string, password: string) => {
    const data = await api<{ token: string; user: AuthUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: email.trim(), password }),
    });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (input: RegisterData) => {
    const data = await api<{ token: string; user: AuthUser; switchToLogin?: boolean }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: input.email.trim(),
        name: input.name?.trim() || input.email.split("@")[0],
        password: input.password,
        phone: input.phone || "",
        company: input.company || "",
      }),
    }).catch(async (err) => {
      // If backend says "use Sign In", auto-fall-back to login (idempotent).
      if (err?.payload?.switchToLogin) {
        return await api<{ token: string; user: AuthUser }>("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email: input.email.trim(), password: input.password }),
        });
      }
      throw err;
    });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    // Clear legacy admin token too
    try { localStorage.removeItem("admin_token"); } catch {}
    try { localStorage.removeItem("admin_email"); } catch {}
  };

  const updateProfile = async (data: { name?: string; phone?: string; company?: string }) => {
    const r = await api<{ user: AuthUser }>("/api/auth/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    }, token);
    setUser(r.user);
    return r.user;
  };

  const value: AuthContextValue = {
    user,
    loading,
    isAdmin: user?.role === "admin",
    token,
    login,
    register,
    logout,
    refresh,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
