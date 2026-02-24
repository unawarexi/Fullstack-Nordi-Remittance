import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";

// Core imports
import MainLayout from "@layout/MainLayout";
import ToastContainer from "@components/ui/ToastContainer";
import { ErrorBoundary } from "@components/shared/ErrorBoundary";
import { PageLoader } from "@components/ui/Spinner";
import ThemeProvider from "@contexts/ThemeProvider";
import { ProtectedRoute } from "@components/shared/ProtectedRoute";
import "./App.css";

// Landing Routes
const LandingRoutes = lazy(() => import("@pages/landing/Landing.routes"));

// Lazy load non-critical routes
const AdminLogin = lazy(() => import("@pages/auth/admin/AdminLogin"));
const AdminMainLayout = lazy(() => import("@pages/admin/app/AdminMainLayout"));
const UserMainLayout = lazy(() => import("@pages/client/app/UserMainLayout"));

// LandingPage component removed (moved to Landing.routes.tsx)

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router basename="/">
          {/* Global Toast Notifications */}
          <ToastContainer />

          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Dashboard Routes (Independent from MainLayout) */}
              {/* Admin Section */}
              <Route path="/admin" element={<AdminLogin />} />
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminMainLayout />
                  </ProtectedRoute>
                }
              />

              {/* Customer Section */}
              <Route
                path="/customer/*"
                element={
                  <ProtectedRoute allowedRoles={["user"]}>
                    <UserMainLayout />
                  </ProtectedRoute>
                }
              />

              {/* Public/MainLayout routes */}
              <Route
                path="/*"
                element={
                  <MainLayout>
                    <LandingRoutes />
                  </MainLayout>
                }
              />
            </Routes>
          </Suspense>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
