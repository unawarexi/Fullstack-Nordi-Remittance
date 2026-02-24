// ============================================================================
// VERIFY SUCCESS PAGE
// ============================================================================

import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";

// Components
import { Button, Spinner } from "@components/ui";
import AuthLayout from "@components/auth_components/AuthLayout";

// Auth hooks and store
import { useVerifyEmail } from "@hooks/queries/useAuth";

const VerifySuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const verifyEmailMutation = useVerifyEmail();
  const hasAttempted = useRef(false);

  useEffect(() => {
    const verifyToken = async () => {
      // Prevent double firing in StrictMode
      if (hasAttempted.current) return;
      hasAttempted.current = true;

      if (!token) {
        return;
      }

      try {
        await verifyEmailMutation.mutateAsync(token);
      } catch (error) {
        // Error is handled by mutation onError
      }
    };

    verifyToken();
  }, [token]);

  // Derived status and message
  const status = verifyEmailMutation.isPending
    ? "loading"
    : verifyEmailMutation.isSuccess
      ? "success"
      : "error";
  const message = verifyEmailMutation.isPending
    ? "Verifying your email address..."
    : verifyEmailMutation.isSuccess
      ? "Your email has been successfully verified! You can now access all features of your account."
      : verifyEmailMutation.error?.message ||
        "Verification failed. The link may be expired or invalid.";

  return (
    <AuthLayout
      title="Email Verification"
      subtitle={
        status === "loading"
          ? "Please wait while we verify your email address..."
          : "Verification Status"
      }
      variant="login"
    >
      <div className="flex flex-col items-center justify-center space-y-6 py-6 pt-4 text-center">
        {/* State Icon */}
        {status === "loading" && (
          <div className="flex h-20 w-20 items-center justify-center pt-2">
            <Spinner size="lg" className="text-primary-600" />
          </div>
        )}

        {status === "success" && (
          <div className="flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
        )}

        {status === "error" && (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-error-100">
            <XCircle className="h-10 w-10 text-error-600" />
          </div>
        )}

        {/* Message */}
        <div className="space-y-4">
          <p
            className={`text-sm ${status === "error" ? "font-medium text-error-600" : "text-neutral-600"}`}
          >
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-4 pt-6">
          {status !== "loading" && (
            <Button
              variant={status === "success" ? "primary" : "outline"}
              fullWidth
              onClick={() => navigate("/auth/login")}
              className={
                status === "success" ? "bg-blue-600 hover:bg-blue-700" : ""
              }
            >
              Return to Login
            </Button>
          )}

          {status === "error" && (
            <button
              type="button"
              onClick={() => navigate("/auth/signup")}
              className="inline-block w-full text-center text-sm font-medium text-primary-600 hover:underline"
            >
              Create a new account
            </button>
          )}
        </div>
      </div>
    </AuthLayout>
  );
};

export default VerifySuccess;
