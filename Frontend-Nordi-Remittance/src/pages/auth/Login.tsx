// ============================================================================
// LOGIN PAGE - Authentication login with Clerk + OTP step-up
// ============================================================================

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, MessageSquare } from "lucide-react";
import { useSignIn, useAuth as useClerkAuth } from "@clerk/clerk-react";

// Components
import { Button, Input, Spinner } from "@components/ui";
import AuthLayout from "@components/auth_components/AuthLayout";

// Auth hooks and store
import { useLogin, useClerkSync } from "@hooks/queries/useAuth";
import { useAuthStore } from "@store/auth.store";

// Validation
import {
  loginSchema,
  type LoginFormData,
} from "@utils/validators/auth.validators";

// ============================================================================
// COMPONENT
// ============================================================================

const Login = () => {
  const navigate = useNavigate();

  // Auth store and mutations
  const { setAuthenticated } = useAuthStore();
  const loginMutation = useLogin();
  const clerkSyncMutation = useClerkSync();

  // Clerk sign-in
  const { signIn, isLoaded: isClerkLoaded, setActive } = useSignIn();
  const { getToken, isSignedIn, signOut } = useClerkAuth();
  const [clerkLoading, setClerkLoading] = useState(false);
  const [clerkError, setClerkError] = useState<string | null>(null);

  // Form setup with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // ──────────────────────────────────────────────────────────────
  // Sync Clerk session with backend → handle OTP or set auth
  // ──────────────────────────────────────────────────────────────
  const syncWithBackend = async () => {
    const token = await getToken();
    if (!token) throw new Error("Failed to obtain session token");

    const response = await clerkSyncMutation.mutateAsync(token);

    if (response.requiresOtp) {
      navigate("/auth/verify-otp", {
        state: {
          otpSessionToken: response.otpSessionToken,
          email: response.email,
          isAdmin: false,
        },
      });
      return;
    }

    // No OTP needed — user is fully authenticated
    if (response.user) {
      setAuthenticated({
        id: response.user.id || (response.user as any)._id,
        email: response.user.email,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        avatar: response.user.avatar,
        role: response.user.role,
        kycStatus: response.user.kycStatus || "pending",
        isEmailVerified: response.user.emailVerified || false,
        isPhoneVerified: response.user.phoneVerified || false,
      });

      navigate(
        response.user.role === "admin"
          ? "/admin/dashboard"
          : "/customer/dashboard",
      );
    }
  };

  // ──────────────────────────────────────────────────────────────
  // Email + Password login via Clerk
  // ──────────────────────────────────────────────────────────────
  const onSubmit = async (data: LoginFormData) => {
    if (!isClerkLoaded || !signIn) return;
    setClerkError(null);

    try {
      // If already signed in with Clerk (e.g. incomplete previous flow), sign out first
      if (isSignedIn) {
        await signOut();
      }

      const result = await signIn.create({
        identifier: data.email,
        password: data.password,
      });

      if (result.status === "complete" && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        await syncWithBackend();
      } else {
        // Clerk needs additional factors — shouldn't happen for email/password but handle gracefully
        setClerkError("Additional verification required. Please try again.");
      }
    } catch (err: any) {
      // Clerk-specific error messages
      const msg =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        err?.message ||
        "Login failed. Please check your credentials.";
      setClerkError(msg);
    }
  };

  // ──────────────────────────────────────────────────────────────
  // Google Sign-In via Clerk OAuth
  // ──────────────────────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    if (!isClerkLoaded || !signIn) return;
    setClerkError(null);
    setClerkLoading(true);

    try {
      // If already signed in with Clerk (e.g. incomplete previous flow), sign out first
      if (isSignedIn) {
        await signOut();
      }

      // Store callback path so SSOCallback knows where to redirect after OAuth
      sessionStorage.setItem("clerk_callback_path", "/auth/clerk-callback");

      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/auth/sso-callback",
        redirectUrlComplete: "/auth/clerk-callback",
      });
    } catch (err: any) {
      setClerkLoading(false);
      setClerkError(
        err?.errors?.[0]?.longMessage || "Google sign-in failed. Try again.",
      );
    }
  };

  const isPending =
    isSubmitting ||
    loginMutation.isPending ||
    clerkSyncMutation.isPending ||
    clerkLoading;

  return (
    <AuthLayout
      title="Welcome to Nordea Internet Banking"
      subtitle="Sign in with your Internet Banking details or Nordea More login details."
      variant="login"
      alternateAction={{
        text: "Not registered?",
        linkText: "Open savings account",
        href: "/auth/signup",
      }}
    >
      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email Input */}
        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          leftIcon={<Mail className="h-5 w-5" />}
          error={errors.email?.message}
          isRequired
          {...register("email")}
        />

        {/* Password Input */}
        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          leftIcon={<Lock className="h-5 w-5" />}
          showPasswordToggle
          error={errors.password?.message}
          isRequired
          {...register("password")}
        />

        {/* Error Display */}
        {(clerkError || loginMutation.error || clerkSyncMutation.error) && (
          <div className="rounded-lg border border-error-200 bg-error-50 p-3 text-sm text-error-600">
            {clerkError ||
              clerkSyncMutation.error?.message ||
              loginMutation.error?.message ||
              "Login failed. Please check your credentials."}
          </div>
        )}

        {/* Forgot Password Link */}
        <div className="text-right">
          <Link
            to="/auth/forgot-password"
            className="text-sm font-medium text-primary-600 hover:underline"
          >
            Forgot Username or Password?
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={isPending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner size="sm" variant="white" />
              Signing in...
            </span>
          ) : (
            "Sign In"
          )}
        </Button>

        {/* Divider */}
        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-300 dark:border-neutral-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-3 text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
              or
            </span>
          </div>
        </div>

        {/* Google Sign-In */}
        <Button
          type="button"
          variant="outline"
          size="lg"
          fullWidth
          disabled={isPending}
          onClick={handleGoogleSignIn}
          className="border-neutral-300 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          <span className="flex items-center justify-center gap-2">
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </span>
        </Button>

        {/* Register Button */}
        <Button
          type="button"
          variant="outline"
          size="lg"
          fullWidth
          onClick={() => navigate("/auth/signup")}
          className="border-primary-600 text-primary-600 hover:bg-primary-50"
        >
          Register on Nordea Banking
        </Button>
      </form>

      {/* Help Section */}
      <div className="mt-8 rounded-xl border border-neutral-200 bg-neutral-100 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary-100 p-2">
            <MessageSquare className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <p className="font-medium text-neutral-900">Need help?</p>
            <p className="mt-1 text-sm text-neutral-600">
              Have any problem?{" "}
              <Link
                to="/contact"
                className="font-medium text-primary-600 hover:underline"
              >
                Chat with us
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
