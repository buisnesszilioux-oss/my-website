import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAdminLoggedIn, verifyAdminToken, clearAdminSession } from "@/lib/adminAuth";

const RequireAdmin = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [state, setState] = useState<"checking" | "ok" | "no">(isAdminLoggedIn() ? "checking" : "no");

  useEffect(() => {
    let cancelled = false;
    if (!isAdminLoggedIn()) { setState("no"); return; }
    (async () => {
      const ok = await verifyAdminToken();
      if (cancelled) return;
      if (ok) setState("ok");
      else { clearAdminSession(); setState("no"); }
    })();
    return () => { cancelled = true; };
  }, [location.pathname]);

  if (state === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-dark">
        <div className="flex flex-col items-center gap-3 text-primary-foreground/80">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Verifying session…</span>
        </div>
      </div>
    );
  }

  if (state === "no") return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
};

export default RequireAdmin;
