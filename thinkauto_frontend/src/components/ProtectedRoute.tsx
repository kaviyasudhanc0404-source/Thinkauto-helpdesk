import { Navigate } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  requiredRole: UserRole;
  children: React.ReactNode;
}

const ProtectedRoute = ({ requiredRole, children }: ProtectedRouteProps) => {
  const { isAuthenticated, role, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role !== requiredRole && role !== "admin") {
    const paths: Record<UserRole, string> = {
      employee: "/employee/dashboard",
      technician: "/technician/dashboard",
      admin: "/admin/dashboard",
    };
    return <Navigate to={paths[role]} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
