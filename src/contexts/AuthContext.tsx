import { createContext, useContext, useState, type ReactNode } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const ADMIN_EMAIL = "miengineering17@gmail.com";
const ADMIN_PASSWORD = "6392061892";
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

  const user: AuthUser | null = isAdmin ? { email: ADMIN_EMAIL, role: "admin" } : null;

  const login = async (email: string, password: string) => {
    if (email.trim().toLowerCase() !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      throw new Error("Invalid email or password.");
    }
    // Sign in to Firebase Auth so Firestore security rules allow writes
    await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    localStorage.setItem(SESSION_KEY, "1");
    localStorage.setItem(EMAIL_KEY, ADMIN_EMAIL);
    setIsAdmin(true);
  };

  const logout = () => {
    signOut(auth).catch(() => {});
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
