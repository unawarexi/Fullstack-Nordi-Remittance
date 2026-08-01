// ============================================================================
// RESET PASSWORD PAGE
// ============================================================================

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

// Components
import { Button, Input, Spinner } from "@components/ui";
import AuthLayout from "@components/auth_components/AuthLayout";

// Auth hooks and store
import { useResetPassword } from "@hooks/api-queries/useAuth";

// Validation
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [isSuccess, setIsSuccess] = useState(false);
  const resetPasswordMutation = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordData) => {
    if (!token) {
      // This case is handled by the warning message in the UI,
      // and the button being disabled.
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({
        token,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      setIsSuccess(true);
    } catch (error) {
      // Error is handled by mutation onError
    }
  };

  // ---------------------------------------------------------------------------
  // SUCCESS STATE VIEW
  // ---------------------------------------------------------------------------
  if (isSuccess) {
    return (
      <AuthLayout
        title="Password Reset Successful"
        subtitle="Your new password has been saved securely."
        variant="login"
      >
        <div className="flex flex-col items-center justify-center space-y-6 py-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 animate-pulse text-green-600" />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-neutral-600">You can now login using your new password.</p>
          </div>

          <div className="w-full pt-6">
            <Button
              variant="primary"
              fullWidth
              onClick={() => navigate("/auth/login")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Proceed to Login
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // ---------------------------------------------------------------------------
  // FORM STATE VIEW
  // ---------------------------------------------------------------------------
  return (
    <AuthLayout
      title="Create New Password"
      subtitle="Your new password must be different from previous used passwords."
      variant="login"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {!token && (
          <div className="mb-4 rounded-lg border border-error-200 bg-error-50 p-3 text-sm font-medium text-error-600">
            Warning: Missing reset token in URL. You cannot submit this form.
          </div>
        )}

        <Input
          label="New Password"
          type="password"
          placeholder="Enter new password"
          leftIcon={<Lock className="h-5 w-5" />}
          showPasswordToggle
          error={errors.password?.message}
          isRequired
          {...register("password")}
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm new password"
          leftIcon={<Lock className="h-5 w-5" />}
          showPasswordToggle
          error={errors.confirmPassword?.message}
          isRequired
          {...register("confirmPassword")}
        />

        {/* API Error Display */}
        {resetPasswordMutation.error && (
          <div className="mt-2 rounded-lg border border-error-200 bg-error-50 p-3 text-sm text-error-600">
            {resetPasswordMutation.error.message || "Failed to reset password. The link may have expired."}
          </div>
        )}

        {/* Requirements text */}
        <div className="mt-2 text-xs font-medium text-neutral-500">
          Password must contain:
          <ul className="ml-5 mt-1 list-disc font-normal opacity-80">
            <li>At least 8 characters</li>
            <li>One uppercase & one lowercase letter</li>
            <li>One number & one special character</li>
          </ul>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={resetPasswordMutation.isPending || !token}
          className="mt-4 bg-blue-600 hover:bg-blue-700"
        >
          {resetPasswordMutation.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner size="sm" variant="white" />
              Resetting...
            </span>
          ) : (
            "Reset Password"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
