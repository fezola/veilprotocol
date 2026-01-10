import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();

  if (requireAuth && !isAuthenticated) {
    // User needs to be authenticated but isn't - redirect to login
    return <Navigate to="/login" replace />;
  }

  if (!requireAuth && isAuthenticated) {
    // User is authenticated but trying to access login page - redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
