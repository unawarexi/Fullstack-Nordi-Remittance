import { useMemo, useCallback, useState } from "react";
import {
  useAdminUserDetails,
  useUpdateUserStatus,
  useDeleteUser,
  useAdminUpdateUser,
  useAdminResetUserPassword,
  useAdminReviewKyc,
} from "@hooks/queries";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================================
// useUserDetail — Aggregates single user detail, status changes & actions
// ============================================================================

export function useUserDetail(userId: string) {
  const { data: userRaw, isLoading, refetch } = useAdminUserDetails(userId as any);
  const updateStatus = useUpdateUserStatus();
  const deleteUserMutation = useDeleteUser();
  const updateUserMutation = useAdminUpdateUser();
  const resetPassword = useAdminResetUserPassword();
  const reviewKyc = useAdminReviewKyc();
  const [confirmAction, setConfirmAction] = useState<{ type: string; visible: boolean } | null>(null);

  const user = useMemo(() => {
    if (!userRaw) return null;
    const u: any = userRaw?.user || userRaw?.data || userRaw;
    return {
      _id: u._id || u.id || "",
      firstName: u.firstName || "",
      middleName: u.middleName || "",
      lastName: u.lastName || "",
      dateOfBirth: u.dateOfBirth || "",
      gender: u.gender || "",
      nationality: u.nationality || "",
      countryOfResidence: u.countryOfResidence || "",
      maritalStatus: u.maritalStatus || "",
      profilePicture: u.profilePicture || "",
      governmentId: u.governmentId || "",
      idType: u.idType || "",
      idNumber: u.idNumber || "",
      idExpiryDate: u.idExpiryDate || "",
      proofOfAddress: u.proofOfAddress || "",
      addressDocType: u.addressDocType || "",
      socialSecurityNumber: u.socialSecurityNumber || "",
      taxIdentificationNumber: u.taxIdentificationNumber || "",
      email: u.email || "",
      mobileNumber: u.mobileNumber || "",
      alternativePhone: u.alternativePhone || "",
      homeAddress: u.homeAddress || "",
      city: u.city || "",
      securityQuestion: u.securityQuestion || "",
      stateProvince: u.stateProvince || "",
      zipCode: u.zipCode || "",
      country: u.country || "",
      accountType: u.accountType || "",
      currency: u.currency || "",
      sourceOfIncome: u.sourceOfIncome || "",
      monthlyIncomeRange: u.monthlyIncomeRange || "",
      initialDeposit: u.initialDeposit ?? 0,
      employmentStatus: u.employmentStatus || "",
      employerName: u.employerName || "",
      occupation: u.occupation || "",
      accountName: u.accountName || "",
      accountNumber: u.accountNumber || "",
      bankName: u.bankName || "",
      bankAddress: u.bankAddress || "",
      ibanNumber: u.ibanNumber || "",
      routingNumber: u.routingNumber || "",
      swiftBic: u.swiftBic || "",
      enableTwoFactor: !!u.enableTwoFactor,
      twoFactorMethod: u.twoFactorMethod || "",
      referralCode: u.referralCode || "",
      selfieWithId: u.selfieWithId || "",
      signature: u.signature || "",
      inviteCode: u.inviteCode || "",
      isActive: !!u.isActive,
      kycStatus: u.kycStatus || "",
      lastLogin: u.lastLogin || null,
      isLocked: !!u.isLocked,
      loginAttempts: u.loginAttempts || [],
      status: u.status || (u.isActive ? "active" : "inactive"),
    };
  }, [userRaw]);

  const activateDeactivate = useCallback(() => {
    if (!user || !userId) return;
    const newStatus = user.isActive ? "suspended" : "active";
    updateStatus.mutate(
      { userId: userId as any, data: { status: newStatus as any, reason: `Admin ${newStatus === "active" ? "activated" : "deactivated"} account` } },
      { onSuccess: () => { refetch(); setConfirmAction(null); } },
    );
  }, [user, userId, updateStatus, refetch]);

  const lockUnlock = useCallback(() => {
    if (!user || !userId) return;
    const newStatus = user.isLocked ? "active" : "suspended";
    updateStatus.mutate(
      { userId: userId as any, data: { status: newStatus as any, reason: `Admin ${user.isLocked ? "unlocked" : "locked"} account` } },
      { onSuccess: () => { refetch(); setConfirmAction(null); } },
    );
  }, [user, userId, updateStatus, refetch]);

  const changeKycStatus = useCallback(
    (kycStatus: string) => {
      if (!userId) return;
      // Map frontend KYC labels to backend-expected values
      const statusMap: Record<string, string> = { verified: "approved", pending: "pending", rejected: "rejected" };
      const mappedStatus = statusMap[kycStatus] || kycStatus;
      reviewKyc.mutate(
        { userId, data: { status: mappedStatus as "approved" | "rejected" | "pending" } },
        { onSuccess: () => { refetch(); setConfirmAction(null); } },
      );
    },
    [userId, reviewKyc, refetch],
  );

  const blockUser = useCallback(() => {
    if (!userId) return;
    updateStatus.mutate(
      { userId: userId as any, data: { status: "suspended" as any, reason: "Blocked by admin" } },
      { onSuccess: () => { refetch(); setConfirmAction(null); } },
    );
  }, [userId, updateStatus, refetch]);

  const deleteUser = useCallback(() => {
    if (!userId) return;
    deleteUserMutation.mutate(userId as any, {
      onSuccess: () => setConfirmAction(null),
    });
  }, [userId, deleteUserMutation]);

  const updateUser = useCallback(
    (data: any) => {
      if (!userId) return;
      updateUserMutation.mutate(
        { userId: userId as any, data },
        { onSuccess: () => refetch() },
      );
    },
    [userId, updateUserMutation, refetch],
  );

  const resetUserPassword = useCallback(() => {
    if (!userId) return;
    resetPassword.mutate(userId as any);
  }, [userId, resetPassword]);

  return {
    user,
    isLoading,
    refetch,
    confirmAction,
    setConfirmAction,
    activateDeactivate,
    lockUnlock,
    changeKycStatus,
    blockUser,
    deleteUser,
    updateUser,
    resetUserPassword,
    isUpdating: updateStatus.isPending || updateUserMutation.isPending,
    isDeleting: deleteUserMutation.isPending,
  };
}

