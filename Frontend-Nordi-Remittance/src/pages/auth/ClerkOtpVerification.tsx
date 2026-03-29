// ============================================================================
// CLERK OTP VERIFICATION PAGE - Step-up OTP after Clerk authentication
// ============================================================================

import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, RotateCw } from "lucide-react";
import { motion } from "framer-motion";

// Components
import { Button, Spinner } from "@components/ui";
import AuthLayout from "@components/auth_components/AuthLayout";

// Auth hooks and store
import { useVerifyClerkOtp, useResendClerkOtp } from "@hooks/queries/useAuth";
import { useAuthStore } from "@store/auth.store";

// ============================================================================
// CONSTANTS
// ============================================================================

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;
// Valid input chars — matches backend set (no ambiguous 0/O/1/I)
const VALID_CHARS = /^[A-HJ-NP-Za-hj-np-z2-9]$/;

// ============================================================================
// COMPONENT
// ============================================================================

const ClerkOtpVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { otpSessionToken, email, isAdmin } = (location.state as {
    otpSessionToken: string;
    email: string;
    isAdmin?: boolean;
  }) || {};

  // Redirect if no session token
  useEffect(() => {
    if (!otpSessionToken) {
      navigate(isAdmin ? "/admin" : "/auth/login", { replace: true });
    }
  }, [otpSessionToken, isAdmin, navigate]);

  // Store and mutations
  const { setAuthenticated } = useAuthStore();
  const verifyMutation = useVerifyClerkOtp();
  const resendMutation = useResendClerkOtp();

  // OTP input state — one character per slot
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend timer
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // ──────────────────────────────────────────────────────────────────
  // Handlers
  // ──────────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(
    async (code: string) => {
      if (!otpSessionToken) return;
      try {
        const response = await verifyMutation.mutateAsync({
          otpSessionToken,
          code: code.toUpperCase(),
          isAdmin,
        });

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
            { replace: true },
          );
        }
      } catch {
        // Error shown via mutation toast — reset inputs
        setOtp(Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
      }
    },
    [otpSessionToken, isAdmin, verifyMutation, setAuthenticated, navigate],
  );

  const handleChange = (index: number, value: string) => {
    // Take only the last typed character
    const char = value.slice(-1);
    if (char && !VALID_CHARS.test(char)) return;

    const next = [...otp];
    next[index] = char.toUpperCase();
    setOtp(next);

    // Auto-advance to next input
    if (char && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    const code = next.join("");
    if (code.length === OTP_LENGTH && next.every(Boolean)) {
      handleSubmit(code);
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/[^A-HJ-NP-Za-hj-np-z2-9]/g, "")
      .toUpperCase()
      .slice(0, OTP_LENGTH);

    if (!pasted) return;

    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setOtp(next);

    // Focus the next empty slot or last filled
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();

    // Auto-submit if full
    if (pasted.length === OTP_LENGTH) {
      handleSubmit(pasted);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || !otpSessionToken) return;
    await resendMutation.mutateAsync(otpSessionToken);
    setCooldown(RESEND_COOLDOWN_SECONDS);
    setOtp(Array(OTP_LENGTH).fill(""));
    inputRefs.current[0]?.focus();
  };

  // Manual submit button
  const onManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length === OTP_LENGTH) handleSubmit(code);
  };

  // ──────────────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────────────

  const maskedEmail = email
    ? `${email.slice(0, 3)}***@${email.split("@")[1]}`
    : "your email";

  return (
    <AuthLayout
      title="Verification Required"
      subtitle={`A ${OTP_LENGTH}-character code has been sent to ${maskedEmail}. Enter it below to continue.`}
      variant="verify"
    >
      <form onSubmit={onManualSubmit} className="space-y-6">
        {/* Security badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-950/30"
        >
          <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            {isAdmin ? "Admin security verification" : "Account security verification"}
          </span>
        </motion.div>

        {/* OTP Input Slots */}
        <div className="flex justify-center gap-3" onPaste={handlePaste}>
          {otp.map((char, i) => (
            <motion.input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="text"
              inputMode="text"
              maxLength={2}
              value={char}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={verifyMutation.isPending}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`
                h-14 w-12 rounded-xl border-2 text-center text-xl font-bold uppercase
                transition-all duration-200 focus:outline-none
                ${
                  verifyMutation.isError
                    ? "border-red-400 bg-red-50 dark:border-red-600 dark:bg-red-950/20"
                    : char
                      ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/30"
                      : "border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-800"
                }
                focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800
                disabled:cursor-not-allowed disabled:opacity-50
                text-neutral-900 dark:text-white
              `}
            />
          ))}
        </div>

        {/* Error */}
        {verifyMutation.isError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-lg border border-error-200 bg-error-50 p-3 text-center text-sm text-error-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"
          >
            {verifyMutation.error?.message || "Invalid code. Please try again."}
          </motion.div>
        )}

        {/* Submit button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={
            otp.join("").length < OTP_LENGTH || verifyMutation.isPending
          }
          className="bg-blue-600 hover:bg-blue-700"
        >
          {verifyMutation.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner size="sm" variant="white" />
              Verifying...
            </span>
          ) : (
            "Verify & Continue"
          )}
        </Button>

        {/* Resend section */}
        <div className="text-center">
          {cooldown > 0 ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Resend code in{" "}
              <span className="font-semibold text-neutral-700 dark:text-neutral-200">
                {cooldown}s
              </span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resendMutation.isPending}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:underline disabled:opacity-50 dark:text-primary-400"
            >
              <RotateCw
                className={`h-4 w-4 ${resendMutation.isPending ? "animate-spin" : ""}`}
              />
              {resendMutation.isPending ? "Sending..." : "Resend code"}
            </button>
          )}
        </div>
      </form>
    </AuthLayout>
  );
};

export default ClerkOtpVerification;
