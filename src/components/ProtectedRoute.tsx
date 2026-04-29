import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

type Props = {
  children: React.ReactNode;
  requireAdmin?: boolean;
  redirectTo?: string;
};

const ProtectedRoute = ({ children, requireAdmin = false, redirectTo }: Props) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Verifying session…</span>
        </div>
      </div>
    );
  }

  if (!user) {
    const fallback = redirectTo ?? (requireAdmin ? "/admin/login" : "/auth");
    return <Navigate to={fallback} replace state={{ from: location.pathname }} />;
  }

  if (requireAdmin && user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
