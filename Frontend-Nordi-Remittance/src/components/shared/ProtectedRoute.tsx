import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@store/auth.store";
import { PageLoader } from "@components/ui/Spinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectPath?: string;
}

/**
 * ProtectedRoute component - Guards routes based on authentication and roles
 * Storing attempted URL for post-login redirect
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  redirectPath = "/auth/login",
}) => {
  const { isAuthenticated, user, isInitialized } = useAuthStore();
  const location = useLocation();

  if (!isInitialized) {
    return <PageLoader />;
  }

  // Not authenticated? Redirect to login but save the current location
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // authenticated but role not allowed? Redirect to previous or home
  if (allowedRoles && user && user.role && !allowedRoles.includes(user.role)) {
    // If user is trying to access admin but is not admin, or vice versa
    const fallbackPath = user.role === "admin" ? "/admin/dashboard" : "/customer/dashboard";

    // Prevent infinite redirect loop: only redirect if going to a DIFFERENT path
    if (fallbackPath !== location.pathname) {
      return <Navigate to={fallbackPath} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
