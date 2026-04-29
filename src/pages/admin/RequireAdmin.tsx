import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

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
