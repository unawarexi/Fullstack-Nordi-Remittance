// ============================================================================
// FORGOT PASSWORD PAGE
// ============================================================================

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { z } from "zod";

// Components
import { Button, Input, Spinner } from "@components/ui";
import AuthLayout from "@components/auth_components/AuthLayout";

// Auth hooks and store
import { useForgotPassword } from "@hooks/api-queries/useAuth";

// Validation
const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);
  const forgotPasswordMutation = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordData) => {
    try {
      await forgotPasswordMutation.mutateAsync({ email: data.email });
      setIsSuccess(true);
    } catch (error) {
      // Error is handled by the mutation's onError callback (toast)
    }
  };

  // ---------------------------------------------------------------------------
  // SUCCESS STATE VIEW
  // ---------------------------------------------------------------------------
  if (isSuccess) {
    return (
      <AuthLayout
        title="Check Your Email"
        subtitle="If an account exists with that email, we've sent instructions to reset your password."
        variant="login"
      >
        <div className="flex flex-col items-center justify-center space-y-6 py-6 text-center">
          <div className="flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-neutral-600">
              We've sent a password reset link to your email address. It will expire in 1 hour.
            </p>
          </div>

          <div className="w-full space-y-4 pt-6">
            <Button variant="outline" fullWidth onClick={() => navigate("/auth/login")}>
              Back to Login
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // ---------------------------------------------------------------------------
  // REQUEST STATE VIEW
  // ---------------------------------------------------------------------------
  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your email address and we'll send you instructions to reset your password."
      variant="login"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your registered email"
          leftIcon={<Mail className="h-5 w-5" />}
          error={errors.email?.message}
          isRequired
          {...register("email")}
        />

        {forgotPasswordMutation.error && (
          <div className="rounded-lg border border-error-200 bg-error-50 p-3 text-sm text-error-600">
            {forgotPasswordMutation.error.message || "Failed to send reset link. Please try again."}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={forgotPasswordMutation.isPending}
          className="mt-2 bg-blue-600 hover:bg-blue-700"
        >
          {forgotPasswordMutation.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner size="sm" variant="white" />
              Sending Link...
            </span>
          ) : (
            "Send Reset Link"
          )}
        </Button>

        <button
          type="button"
          onClick={() => navigate("/auth/login")}
          className="flex w-full items-center justify-center gap-2 py-2 text-sm font-medium text-neutral-600 transition-colors hover:text-primary-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </button>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;
