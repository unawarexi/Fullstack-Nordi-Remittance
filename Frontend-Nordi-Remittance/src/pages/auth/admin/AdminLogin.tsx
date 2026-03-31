/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Mail, Lock, Shield, ShieldCheck, Globe, Fingerprint } from "lucide-react";
import { useSignIn, useAuth as useClerkAuth } from "@clerk/clerk-react";

import { Button, Input, Spinner } from "@components/ui";
import Images from '@constants/images';
import GetLocation from "@utils/GetLocation";
import { useAdminLogin } from "@hooks/queries/useAdmin";
import { useClerkSyncAdmin } from "@hooks/queries/useAuth";
import { useAuthStore } from "@store/auth.store";
import { loginSchema, type LoginFormData } from "@utils/validators/auth.validators";

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// ============================================================================
// FEATURE PILL
// ============================================================================
const FeaturePill: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <motion.div
    variants={itemVariants}
    className="flex items-center gap-2.5 rounded-lg bg-white/10 backdrop-blur-sm px-4 py-3"
  >
    <span className="text-white/90">{icon}</span>
    <span className="text-sm font-medium text-white/80">{text}</span>
  </motion.div>
);

// ============================================================================
// ADMIN LOGIN COMPONENT
// ============================================================================
const AdminLogin = () => {
  const navigate = useNavigate();
  const { setAuthenticated } = useAuthStore();
  const loginMutation = useAdminLogin();
  const clerkSyncAdminMutation = useClerkSyncAdmin();

  // Clerk sign-in
  const { signIn, isLoaded: isClerkLoaded, setActive } = useSignIn();
  const { getToken, isSignedIn, signOut } = useClerkAuth();
  const [clerkError, setClerkError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Sync Clerk session with admin backend endpoint
  const syncAdminWithBackend = async () => {
    const token = await getToken();
    if (!token) throw new Error("Failed to obtain session token");

    const response = await clerkSyncAdminMutation.mutateAsync(token);

    if (response.requiresOtp) {
      navigate("/auth/verify-otp", {
        state: {
          otpSessionToken: response.otpSessionToken,
          email: response.email,
          isAdmin: true,
        },
      });
      return;
    }

    if (response.user) {
      setAuthenticated({
        id: response.user.id || (response.user as any)._id,
        email: response.user.email,
        firstName: response.user.firstName || "Admin",
        lastName: response.user.lastName || "",
        role: "admin",
        kycStatus: "verified",
        isEmailVerified: true,
        isPhoneVerified: true,
      });
      navigate("/admin/dashboard");
    }
  };

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
        await syncAdminWithBackend();
      } else {
        setClerkError("Additional verification required. Please try again.");
      }
    } catch (err: any) {
      setClerkError(
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        err?.message ||
        "Login failed. Please check your credentials.",
      );
    }
  };

  // Google Sign-In for admins
  const handleGoogleSignIn = async () => {
    if (!isClerkLoaded || !signIn) return;
    setClerkError(null);

    try {
      // If already signed in with Clerk (e.g. incomplete previous flow), sign out first
      if (isSignedIn) {
        await signOut();
      }

      // Store admin callback path so SSOCallback knows where to redirect after OAuth
      sessionStorage.setItem("clerk_callback_path", "/auth/clerk-admin-callback");

      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/auth/sso-callback",
        redirectUrlComplete: "/auth/clerk-admin-callback",
      });
    } catch (err: any) {
      setClerkError(
        err?.errors?.[0]?.longMessage || "Google sign-in failed. Try again.",
      );
    }
  };

  const isPending =
    isSubmitting || loginMutation.isPending || clerkSyncAdminMutation.isPending;

  return (
    <section className="relative flex min-h-screen w-full overflow-hidden">
      {/* ─── LEFT: Form ─── */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex w-full flex-col justify-center bg-slate-50 dark:bg-neutral-900 px-6 py-8 md:w-1/2 lg:w-[55%] md:px-12 lg:px-20 transition-colors duration-300"
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="group flex items-center gap-3">
            <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-2 transition-colors group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50">
              <Globe className="h-5 w-5 text-blue-600 sm:h-6 sm:w-6" />
            </div>
            <div>
              <p className="text-base text-neutral-800 dark:text-neutral-100 sm:text-lg italic uppercase font-black">
                Internet Banking
              </p>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-widest font-bold">Quick Access</p>
            </div>
          </Link>
          <GetLocation />
        </div>

        {/* Admin Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-2 inline-flex w-fit items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 px-3 py-1"
        >
          <Shield className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
            Admin Portal
          </span>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white">
            Administration Console
          </h1>
          <p className="mt-3 text-neutral-600 dark:text-neutral-400 text-base md:text-lg">
            Sign in with your administrator credentials to access the management dashboard.
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-md space-y-5"
        >
          <Input
            label="Admin Email"
            type="email"
            placeholder="admin@nordi.com"
            leftIcon={<Mail className="h-5 w-5" />}
            error={errors.email?.message}
            isRequired
            {...register("email")}
          />

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

          {/* API Error */}
          {(clerkError || loginMutation.error || clerkSyncAdminMutation.error) && (
            <div className="rounded-lg border border-error-200 dark:border-red-800 bg-error-50 dark:bg-red-950/30 p-3 text-sm text-error-600 dark:text-red-400">
              {clerkError || (clerkSyncAdminMutation.error as any)?.message || (loginMutation.error as any)?.message || "Login failed. Please check your credentials."}
            </div>
          )}

          {/* Forgot Password */}
          <div className="text-right">
            <Link
              to="/auth/forgot-password"
              className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
            >
              Forgot Admin Password?
            </Link>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isPending}
            className="bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size="sm" variant="white" />
                Authenticating...
              </span>
            ) : (
              "Sign In to Admin"
            )}
          </Button>

          {/* Divider */}
          <div className="relative my-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-300 dark:border-neutral-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-slate-50 px-3 text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">or</span>
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
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </span>
          </Button>
        </motion.form>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 w-full max-w-md rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/20 p-4"
        >
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-amber-100 dark:bg-amber-900/40 p-2">
              <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="font-medium text-neutral-900 dark:text-white text-sm">Restricted Access</p>
              <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                Authorized personnel only. All login attempts are logged and monitored for security compliance.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-auto pt-8 text-center text-xs text-neutral-500 dark:text-neutral-400"
        >
          <p>&copy; {new Date().getFullYear()} Nordea Bank PLC. (Licensed by the International Monetary Fund)</p>
          <div className="mt-2 flex items-center justify-center gap-4">
            <Link to="/privacy" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              Privacy Policy
            </Link>
            <span>&middot;</span>
            <Link to="/terms" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              Terms of Service
            </Link>
            <span>&middot;</span>
            <Link to="/contact" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              IT Support
            </Link>
          </div>
        </motion.div>
      </motion.div>

      {/* ─── RIGHT: Visual / Image ─── */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="hidden md:flex md:w-1/2 lg:w-[45%] relative overflow-hidden"
      >
        {/* Background Image */}
        <img
          src={Images.adminLoginBg}
          alt="Admin Portal"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Dark overlay for legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/80 via-slate-900/70 to-slate-900/90" />

        {/* Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 flex flex-col items-center justify-center w-full p-8 lg:p-14"
        >
          {/* Title */}
          <motion.div variants={itemVariants} className="text-center mb-10">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
              Nordi Admin Console
            </h2>
            <p className="text-white/70 text-sm max-w-xs mx-auto">
              Secure management portal for system administrators and compliance officers
            </p>
          </motion.div>

          {/* Feature pills */}
          <div className="w-full max-w-sm space-y-3">
            <FeaturePill
              icon={<ShieldCheck className="h-4 w-4" />}
              text="256-bit encrypted sessions & audit logging"
            />
            <FeaturePill
              icon={<Fingerprint className="h-4 w-4" />}
              text="Multi-factor authentication enforced"
            />
            <FeaturePill
              icon={<Globe className="h-4 w-4" />}
              text="Real-time monitoring & compliance tools"
            />
          </div>

          {/* Card image */}
          <motion.div variants={itemVariants} className="mt-10">
            <img
              src={Images.authCard1}
              alt="Banking Card"
              className="w-full max-w-[260px] mx-auto drop-shadow-2xl"
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default AdminLogin;
