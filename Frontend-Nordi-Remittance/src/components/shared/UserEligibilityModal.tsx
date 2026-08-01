// ============================================================================
// USER ELIGIBILITY MODAL
// Shown when an admin operation fails because the target user has pending KYC
// or a blocked/locked/inactive account. Provides admin quick-actions to resolve.
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import { ShieldAlert, UserX, Lock, CheckCircle, Unlock, UserCheck, X, AlertTriangle } from "lucide-react";
import { Modal } from "@components/ui";
import { useUpdateUserStatus, useAdminReviewKyc } from "@hooks/api-queries";

// ============================================================================
// TYPES
// ============================================================================

export type EligibilityBlockType =
  | "KYC_PENDING"
  | "ACCOUNT_LOCKED"
  | "ACCOUNT_SUSPENDED"
  | "ACCOUNT_BANNED"
  | "ACCOUNT_INACTIVE";

export interface EligibilityErrorDetails {
  userId: string;
  userName: string;
  email?: string;
  blockType: EligibilityBlockType;
  reason?: string;
  kycStatus?: string;
}

interface UserEligibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  error: EligibilityErrorDetails | null;
  onResolved?: () => void;
}

// ============================================================================
// ERROR CODE → BLOCK TYPE MAPPING
// ============================================================================

const ERROR_CODE_MAP: Record<string, EligibilityBlockType> = {
  E3005: "KYC_PENDING",
  E1006: "ACCOUNT_LOCKED",
  E1007: "ACCOUNT_SUSPENDED",
  E1005: "ACCOUNT_BANNED",
};

/**
 * Parse an API error response into EligibilityErrorDetails.
 * Returns null if the error is not an eligibility error.
 */
export function parseEligibilityError(error: unknown): EligibilityErrorDetails | null {
  const axiosErr = error as {
    response?: { data?: { error?: { code?: string; message?: string; details?: Record<string, unknown> } } };
  };
  const apiError = axiosErr?.response?.data?.error;
  if (!apiError?.code || !apiError.details) return null;

  const blockType = (apiError.details.blockType as EligibilityBlockType) || ERROR_CODE_MAP[apiError.code];
  if (!blockType) return null;

  return {
    userId: apiError.details.userId as string,
    userName: (apiError.details.userName as string) || "Unknown User",
    email: apiError.details.email as string | undefined,
    blockType,
    reason: (apiError.details.reason as string) || apiError.message,
    kycStatus: apiError.details.kycStatus as string | undefined,
  };
}

// ============================================================================
// BLOCK TYPE CONFIG
// ============================================================================

const BLOCK_CONFIG: Record<
  EligibilityBlockType,
  {
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    title: string;
    description: (name: string, reason?: string) => string;
    actionLabel: string;
    actionIcon: React.ReactNode;
  }
> = {
  KYC_PENDING: {
    icon: <ShieldAlert size={24} />,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    title: "KYC Verification Required",
    description: (name, reason) =>
      `${name}'s KYC status is ${reason || "pending"}. Financial operations are blocked until KYC is approved.`,
    actionLabel: "Approve KYC",
    actionIcon: <CheckCircle size={16} />,
  },
  ACCOUNT_LOCKED: {
    icon: <Lock size={24} />,
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-50 dark:bg-rose-950/30",
    title: "Account Locked",
    description: (name, reason) =>
      `${name}'s account is locked${reason ? `: ${reason}` : ""}. All financial operations are blocked.`,
    actionLabel: "Unlock Account",
    actionIcon: <Unlock size={16} />,
  },
  ACCOUNT_SUSPENDED: {
    icon: <UserX size={24} />,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    title: "Account Suspended",
    description: (name) =>
      `${name}'s account is suspended. All financial operations are blocked until the account is reactivated.`,
    actionLabel: "Activate Account",
    actionIcon: <UserCheck size={16} />,
  },
  ACCOUNT_BANNED: {
    icon: <AlertTriangle size={24} />,
    color: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    title: "Account Banned",
    description: (name) =>
      `${name}'s account has been banned. All operations are permanently blocked. Contact a super admin to lift the ban.`,
    actionLabel: "Activate Account",
    actionIcon: <UserCheck size={16} />,
  },
  ACCOUNT_INACTIVE: {
    icon: <UserX size={24} />,
    color: "text-gray-600 dark:text-gray-400 dark:text-neutral-500",
    bgColor: "bg-gray-50 dark:bg-gray-900",
    title: "Account Inactive",
    description: (name) =>
      `${name}'s account is inactive. The account needs to be activated before any financial operations.`,
    actionLabel: "Activate Account",
    actionIcon: <UserCheck size={16} />,
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

export const UserEligibilityModal: React.FC<UserEligibilityModalProps> = ({ isOpen, onClose, error, onResolved }) => {
  const updateStatus = useUpdateUserStatus();
  const reviewKyc = useAdminReviewKyc();

  if (!error) return null;

  const config = BLOCK_CONFIG[error.blockType];
  const isPending = updateStatus.isPending || reviewKyc.isPending;

  const handleResolve = () => {
    if (error.blockType === "KYC_PENDING") {
      reviewKyc.mutate(
        {
          userId: error.userId,
          data: { status: "approved" },
        },
        {
          onSuccess: () => {
            onResolved?.();
            onClose();
          },
        },
      );
    } else {
      // For locked / suspended / inactive / banned → set status to 'active'
      const payload: { status: UserStatus; reason?: string } = {
        status: "active" as UserStatus,
        reason: "Admin resolved eligibility block",
      };

      updateStatus.mutate(
        { userId: error.userId as UUID, data: payload },
        {
          onSuccess: () => {
            onResolved?.();
            onClose();
          },
        },
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" title="">
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        {/* Icon */}
        <div className={`flex h-14 w-14 items-center justify-center rounded-full ${config.bgColor} ${config.color}`}>
          {config.icon}
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">{config.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400 dark:text-neutral-500">
            {config.description(error.userName, error.reason)}
          </p>
          {error.email && (
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 dark:text-neutral-400">{error.email}</p>
          )}
        </div>

        {/* Actions */}
        <div className="mt-2 flex w-full items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <X size={16} />
            Dismiss
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleResolve}
            disabled={isPending}
            className="dark:bg-indigo-900/300 flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-50 dark:hover:bg-indigo-600"
          >
            {isPending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              config.actionIcon
            )}
            {isPending ? "Processing..." : config.actionLabel}
          </motion.button>
        </div>
      </div>
    </Modal>
  );
};

export default UserEligibilityModal;
