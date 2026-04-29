import { useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getAdminToken, setAdminSession } from "@/lib/adminAuth";

const Spinner = ({ label }: { label: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-charcoal">
    <div className="flex flex-col items-center gap-3 text-amber-300">
      <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  </div>
);

const RequireAdmin = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { user, isAdmin, loading } = useAuth();
  const provisionedRef = useRef(false);

  // Once we know the user is an admin, silently mint the legacy admin token
  // (for any admin-side endpoint that still uses it). This is fire-and-forget.
  useEffect(() => {
    if (!isAdmin || !user?.email) return;
    if (provisionedRef.current) return;
    if (getAdminToken()) { provisionedRef.current = true; return; }
    provisionedRef.current = true;
    (async () => {
      try {
        const realFetch = (window as any).__realFetch__ || fetch;
        const res = await realFetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: user.email, password: "6392061892" }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data?.token) setAdminSession(data.token, user.email);
      } catch { /* ignore — admin still works without legacy token */ }
    })();
  }, [isAdmin, user?.email]);

  if (loading) return <Spinner label="Verifying session…" />;

  if (!user || !isAdmin) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <>{children}</>;
};

export default RequireAdmin;
