import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api, getToken, clearToken } from "@/lib/api";

const RequireAdmin = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<"checking" | "ok" | "denied">("checking");

  useEffect(() => {
    const t = getToken();
    if (!t) { setState("denied"); return; }
    let cancelled = false;
    (async () => {
      try {
        await api("/api/admin/verify");
        if (!cancelled) setState("ok");
      } catch {
        clearToken();
        if (!cancelled) setState("denied");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (state === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-dark">
        <div className="text-primary-foreground/80 text-sm">Verifying session…</div>
      </div>
    );
  }
  if (state === "denied") return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
};

export default RequireAdmin;
