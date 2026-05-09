import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

const ALLOWED_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || "")
  .split(",")
  .map((e: string) => e.trim().toLowerCase())
  .filter(Boolean);

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
    try { return localStorage.getItem(SESSION_KEY) === "1"; } catch { return false; }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setIsAdmin(false);
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(EMAIL_KEY);
      }
    });
    return unsub;
  }, []);

  const user: AuthUser | null = isAdmin
    ? { email: localStorage.getItem(EMAIL_KEY) || "", role: "admin" }
    : null;

  const login = async (email: string, password: string) => {
    const normalised = email.trim().toLowerCase();
    if (ALLOWED_EMAILS.length > 0 && !ALLOWED_EMAILS.includes(normalised)) {
      throw new Error("Invalid email or password.");
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, normalised, password);
      localStorage.setItem(SESSION_KEY, "1");
      localStorage.setItem(EMAIL_KEY, normalised);
      setIsAdmin(true);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    signOut(auth).catch(() => {});
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(EMAIL_KEY);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
