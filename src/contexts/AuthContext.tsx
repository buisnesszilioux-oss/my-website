/**
 * AuthContext (Firebase Auth)
 * ---------------------------
 * Replaces the old Postgres + JWT auth. Now backed entirely by Firebase Auth +
 * a `users/{uid}` profile document in Firestore. Admins are determined by the
 * email allow-list in `VITE_ADMIN_EMAILS` (see `src/lib/firebase.ts`).
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile as fbUpdateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, isAdminEmail } from "@/lib/firebase";

export type UserRole = "admin" | "user";

export type AuthUser = {
  id: string;
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
  loginWithGoogle: () => Promise<AuthUser>;
  register: (data: RegisterData) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  updateProfile: (data: { name?: string; phone?: string; company?: string }) => Promise<AuthUser>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadOrCreateProfile(fbUser: FirebaseUser, extra?: Partial<AuthUser>): Promise<AuthUser> {
  const ref = doc(db, "users", fbUser.uid);
  const snap = await getDoc(ref);
  const email = (fbUser.email || "").toLowerCase();
  const role: UserRole = isAdminEmail(email) ? "admin" : "user";

  if (!snap.exists()) {
    const profile = {
      email,
      name: extra?.name || fbUser.displayName || email.split("@")[0],
      phone: extra?.phone || "",
      company: extra?.company || "",
      picture: fbUser.photoURL || "",
      provider: fbUser.providerData[0]?.providerId || "password",
      createdAt: serverTimestamp(),
    };
    await setDoc(ref, profile);
    return {
      id: fbUser.uid,
      email,
      name: profile.name,
      phone: profile.phone,
      company: profile.company,
      picture: profile.picture,
      role,
      provider: profile.provider,
      createdAt: new Date().toISOString(),
    };
  }
  const data: any = snap.data();
  return {
    id: fbUser.uid,
    email,
    name: data.name || fbUser.displayName || email.split("@")[0],
    phone: data.phone || "",
    company: data.company || "",
    picture: data.picture || fbUser.photoURL || "",
    role,
    provider: data.provider || "password",
    createdAt: data.createdAt?.toDate?.()?.toISOString?.() || null,
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      try {
        if (!fbUser) {
          setUser(null);
          setToken(null);
          return;
        }
        const profile = await loadOrCreateProfile(fbUser);
        setUser(profile);
        setToken(await fbUser.getIdToken());
      } catch (e) {
        console.error("[auth] state change failed", e);
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const refresh = async () => {
    const fbUser = auth.currentUser;
    if (!fbUser) {
      setUser(null);
      setToken(null);
      return;
    }
    const profile = await loadOrCreateProfile(fbUser);
    setUser(profile);
    setToken(await fbUser.getIdToken(true));
  };

  const login = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    const profile = await loadOrCreateProfile(cred.user);
    setUser(profile);
    setToken(await cred.user.getIdToken());
    return profile;
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const cred = await signInWithPopup(auth, provider);
    const profile = await loadOrCreateProfile(cred.user);
    setUser(profile);
    setToken(await cred.user.getIdToken());
    return profile;
  };

  const register = async (input: RegisterData) => {
    const cred = await createUserWithEmailAndPassword(auth, input.email.trim(), input.password);
    if (input.name) {
      try { await fbUpdateProfile(cred.user, { displayName: input.name }); } catch { /* ignore */ }
    }
    const profile = await loadOrCreateProfile(cred.user, {
      name: input.name,
      phone: input.phone,
      company: input.company,
    });
    setUser(profile);
    setToken(await cred.user.getIdToken());
    return profile;
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem("mi_admin_token");
      localStorage.removeItem("mi_admin_email");
      localStorage.removeItem("mi_user_token");
    } catch { /* ignore */ }
  };

  const updateProfile = async (data: { name?: string; phone?: string; company?: string }) => {
    const fbUser = auth.currentUser;
    if (!fbUser) throw new Error("Not signed in");
    const ref = doc(db, "users", fbUser.uid);
    const patch: any = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.phone !== undefined) patch.phone = data.phone;
    if (data.company !== undefined) patch.company = data.company;
    await setDoc(ref, patch, { merge: true });
    if (data.name) {
      try { await fbUpdateProfile(fbUser, { displayName: data.name }); } catch { /* ignore */ }
    }
    const profile = await loadOrCreateProfile(fbUser);
    setUser(profile);
    return profile;
  };

  const value: AuthContextValue = {
    user,
    loading,
    isAdmin: !!user && user.role === "admin",
    token,
    login,
    loginWithGoogle,
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
