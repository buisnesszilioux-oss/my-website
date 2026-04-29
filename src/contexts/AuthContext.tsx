import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile as fbUpdateProfile,
  type User as FbUser,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, ADMIN_EMAIL } from "@/lib/firebase";

export type UserRole = "admin" | "user";

export type AuthUser = {
  uid: string;
  email: string;
  name: string;
  phone: string;
  company: string;
  picture: string;
  role: UserRole;
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
  firebaseUser: FbUser | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (data: RegisterData) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  updateProfile: (data: { name?: string; phone?: string; company?: string }) => Promise<AuthUser>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function roleForEmail(email: string): UserRole {
  return email.trim().toLowerCase() === ADMIN_EMAIL ? "admin" : "user";
}

async function loadOrCreateUserDoc(fbUser: FbUser, defaults?: Partial<AuthUser>): Promise<AuthUser> {
  const userRef = doc(db, "users", fbUser.uid);
  const snap = await getDoc(userRef);
  const email = (fbUser.email ?? defaults?.email ?? "").toLowerCase();
  const role = roleForEmail(email);

  if (!snap.exists()) {
    const data = {
      uid: fbUser.uid,
      email,
      name: defaults?.name ?? fbUser.displayName ?? "",
      phone: defaults?.phone ?? "",
      company: defaults?.company ?? "",
      picture: fbUser.photoURL ?? "",
      role,
      createdAt: serverTimestamp(),
    };
    await setDoc(userRef, data);
    return { ...data, createdAt: new Date().toISOString() } as AuthUser;
  }

  const existing = snap.data() as Partial<AuthUser> & { createdAt?: { toDate?: () => Date } };
  // Always reconcile role with admin email rule (in case admin email changes)
  if (existing.role !== role) {
    await setDoc(userRef, { role }, { merge: true });
  }
  const createdAtIso =
    existing.createdAt && typeof (existing.createdAt as any).toDate === "function"
      ? (existing.createdAt as any).toDate().toISOString()
      : typeof existing.createdAt === "string"
        ? existing.createdAt
        : null;
  return {
    uid: fbUser.uid,
    email,
    name: existing.name ?? fbUser.displayName ?? "",
    phone: existing.phone ?? "",
    company: existing.company ?? "",
    picture: existing.picture ?? fbUser.photoURL ?? "",
    role,
    createdAt: createdAtIso,
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FbUser | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (!fbUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const profile = await loadOrCreateUserDoc(fbUser);
        setUser(profile);
      } catch (e) {
        console.error("[auth] failed to load user doc", e);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const refresh = async () => {
    if (!auth.currentUser) {
      setUser(null);
      return;
    }
    const profile = await loadOrCreateUserDoc(auth.currentUser);
    setUser(profile);
  };

  const login = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    const profile = await loadOrCreateUserDoc(cred.user);
    setUser(profile);
    setFirebaseUser(cred.user);
    return profile;
  };

  const register = async (data: RegisterData) => {
    const cred = await createUserWithEmailAndPassword(auth, data.email.trim(), data.password);
    if (data.name) {
      try { await fbUpdateProfile(cred.user, { displayName: data.name }); } catch { /* non-fatal */ }
    }
    const profile = await loadOrCreateUserDoc(cred.user, {
      name: data.name,
      phone: data.phone ?? "",
      company: data.company ?? "",
      email: data.email,
    });
    setUser(profile);
    setFirebaseUser(cred.user);
    return profile;
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setFirebaseUser(null);
  };

  const updateProfile = async (data: { name?: string; phone?: string; company?: string }) => {
    if (!auth.currentUser) throw new Error("Not signed in");
    const userRef = doc(db, "users", auth.currentUser.uid);
    await setDoc(userRef, data, { merge: true });
    if (data.name) {
      try { await fbUpdateProfile(auth.currentUser, { displayName: data.name }); } catch { /* non-fatal */ }
    }
    const profile = await loadOrCreateUserDoc(auth.currentUser);
    setUser(profile);
    return profile;
  };

  const value: AuthContextValue = {
    user,
    firebaseUser,
    loading,
    isAdmin: user?.role === "admin",
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
