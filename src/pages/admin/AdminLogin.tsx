import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const AdminLogin = () => {
  const location = useLocation();
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-dark">
        <div className="flex flex-col items-center gap-3 text-primary-foreground/80">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Checking session…</span>
        </div>
      </div>
    );
  }

  if (isAdmin) return <Navigate to="/admin" replace />;

  return (
    <Navigate
      to="/auth"
      replace
      state={{ from: location.pathname, requireAdmin: true }}
    />
  );
};

export default AdminLogin;
