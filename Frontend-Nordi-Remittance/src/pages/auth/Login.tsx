// ============================================================================
// LOGIN PAGE - Authentication login with react-hook-form and Zod
// ============================================================================

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, MessageSquare } from "lucide-react";

// Components
import { Button, Input, Spinner } from "@components/ui";
import AuthLayout from "@components/auth_components/AuthLayout";

// Auth hooks and store
import { useLogin } from "@hooks/queries/useAuth";
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

  // Auth store and mutation
  const { setAuthenticated } = useAuthStore();
  const loginMutation = useLogin();

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

  // Form submission handler
  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await loginMutation.mutateAsync(data);

      // If 2FA is required, handle it
      if (response.requiresTwoFactor) {
        // Store temp data and redirect to 2FA page
        navigate("/auth/verify-2fa", {
          state: {
            email: data.email,
            tempToken: response.tempToken,
            method: response.twoFactorMethod,
          },
        });
        return;
      }

      // Set authenticated state
      if (response.user) {
        setAuthenticated({
          id: response.user.id,
          email: response.user.email,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          avatar: response.user.avatar,
          role: response.user.role,
          kycStatus: response.user.kycStatus || "pending",
          isEmailVerified: response.user.emailVerified || false,
          isPhoneVerified: response.user.phoneVerified || false,
        });
      }

      // Redirect to dashboard based on role
      if (response.user.role === "admin") {
        // Notification is handled in the mutation
        navigate("/admin/dashboard");
      } else {
        navigate("/customer/dashboard");
      }
    } catch (error) {
      // Error is handled by the mutation's onError callback
      console.error("Login failed:", error);
    }
  };

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

        {/* API Error Display */}
        {loginMutation.error && (
          <div className="rounded-lg border border-error-200 bg-error-50 p-3 text-sm text-error-600">
            {loginMutation.error.message ||
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
          disabled={isSubmitting || loginMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting || loginMutation.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner size="sm" variant="white" />
              Signing in...
            </span>
          ) : (
            "Sign In"
          )}
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
