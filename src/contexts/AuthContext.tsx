import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type AuthUser = {
  id: number;
  email: string;
  name: string;
  phone: string;
  company: string;
  picture: string;
  provider: string;
  createdAt: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (data: { name: string; email: string; password: string; phone?: string; company?: string }) => Promise<AuthUser>;
  loginWithGoogle: (credential: string) => Promise<AuthUser>;
  logout: () => void;
  refresh: () => Promise<void>;
  updateProfile: (data: { name?: string; phone?: string; company?: string }) => Promise<AuthUser>;
};

const TOKEN_KEY = "mi_user_token";
const AuthContext = createContext<AuthContextValue | null>(null);

async function authFetch<T>(path: string, opts: RequestInit = {}, token?: string | null): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json", ...(opts.headers as any) };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(path, { ...opts, headers });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || `Request failed (${res.status})`);
  return json as T;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(!!token);

  const persistToken = (t: string | null) => {
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
    setTokenState(t);
  };

  const refresh = async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await authFetch<{ user: AuthUser }>("/api/auth/me", {}, token);
      setUser(data.user);
    } catch {
      persistToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await authFetch<{ token: string; user: AuthUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    persistToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const register = async (data: { name: string; email: string; password: string; phone?: string; company?: string }) => {
    const res = await authFetch<{ token: string; user: AuthUser }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    persistToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const loginWithGoogle = async (credential: string) => {
    const res = await authFetch<{ token: string; user: AuthUser }>("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential }),
    });
    persistToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const updateProfile = async (data: { name?: string; phone?: string; company?: string }) => {
    const res = await authFetch<{ user: AuthUser }>("/api/auth/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    }, token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    persistToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, loginWithGoogle, logout, refresh, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
