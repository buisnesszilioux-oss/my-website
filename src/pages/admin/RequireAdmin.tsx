import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const RequireAdmin = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-dark">
        <div className="flex flex-col items-center gap-3 text-primary-foreground/80">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Verifying session…</span>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  if (user.role !== "admin") return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

export default RequireAdmin;
