import React from "react";
import { Routes, Route } from "react-router-dom";
import NotAvailableYet from "@components/shared/RenderContent";
import AdminOverview from "./components/AdminOverview";
import OverviewUsers from "./components/users/OverviewUsers";
import UsersManagement from "./components/UsersManagement";
import UserEdit from "./components/users/UserEdit";
import CreateUser from "./components/users/CreateUser";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="dashboard" element={<AdminOverview />} />
      {/* Users Management */}
      <Route path="users/all" element={<OverviewUsers />} />
      <Route path="users/create" element={<CreateUser />} />
      <Route path="users/:id" element={<UsersManagement />} />
      <Route path="users/:id/edit" element={<UserEdit />} />
      <Route path="users/kyc-pending" element={<NotAvailableYet />} />
      <Route path="users/blocked" element={<NotAvailableYet />} />
      <Route path="users/vip" element={<NotAvailableYet />} />
      {/* Transactions */}
      <Route path="transactions" element={<NotAvailableYet />} />
      <Route path="transactions/all" element={<NotAvailableYet />} />
      <Route path="transactions/pending" element={<NotAvailableYet />} />
      <Route path="transactions/failed" element={<NotAvailableYet />} />
      <Route path="transactions/international" element={<NotAvailableYet />} />
      <Route path="transactions/suspicious" element={<NotAvailableYet />} />
      {/* KYC / Identity Verification */}
      <Route path="kyc" element={<NotAvailableYet />} />
      <Route path="kyc/pending" element={<NotAvailableYet />} />
      <Route path="kyc/verified" element={<NotAvailableYet />} />
      <Route path="kyc/rejected" element={<NotAvailableYet />} />
      <Route path="kyc/enhanced" element={<NotAvailableYet />} />
      {/* Loan Management */}
      <Route path="loans" element={<NotAvailableYet />} />
      <Route path="loans/all" element={<NotAvailableYet />} />
      <Route path="loans/pending" element={<NotAvailableYet />} />
      <Route path="loans/approved" element={<NotAvailableYet />} />
      <Route path="loans/rejected" element={<NotAvailableYet />} />
      <Route path="loans/delinquent" element={<NotAvailableYet />} />
      {/* Investment Products */}
      <Route path="investments" element={<NotAvailableYet />} />
      <Route path="investments/all" element={<NotAvailableYet />} />
      <Route path="investments/fixed-deposits" element={<NotAvailableYet />} />
      <Route path="investments/mutual-funds" element={<NotAvailableYet />} />
      <Route path="investments/bonds" element={<NotAvailableYet />} />
      <Route path="investments/equity" element={<NotAvailableYet />} />
      {/* Bank Accounts */}
      <Route path="accounts" element={<NotAvailableYet />} />
      <Route path="accounts/savings" element={<NotAvailableYet />} />
      <Route path="accounts/current" element={<NotAvailableYet />} />
      <Route path="accounts/fixed-deposits" element={<NotAvailableYet />} />
      <Route path="accounts/dormant" element={<NotAvailableYet />} />
      {/* Foreign Exchange */}
      <Route path="forex" element={<NotAvailableYet />} />
      <Route path="forex/rates" element={<NotAvailableYet />} />
      <Route path="forex/transactions" element={<NotAvailableYet />} />
      <Route path="forex/remittances" element={<NotAvailableYet />} />
      {/* Reports & Analytics */}
      <Route path="reports" element={<NotAvailableYet />} />
      <Route path="reports/financial" element={<NotAvailableYet />} />
      <Route path="reports/users" element={<NotAvailableYet />} />
      <Route path="reports/transactions" element={<NotAvailableYet />} />
      <Route path="reports/risk" element={<NotAvailableYet />} />
      <Route path="reports/regulatory" element={<NotAvailableYet />} />
      {/* Fraud Monitoring */}
      <Route path="fraud" element={<NotAvailableYet />} />
      <Route path="fraud/alerts" element={<NotAvailableYet />} />
      <Route path="fraud/cases" element={<NotAvailableYet />} />
      <Route path="fraud/aml" element={<NotAvailableYet />} />
      {/* Audit Logs */}
      <Route path="logs" element={<NotAvailableYet />} />
      {/* Communications */}
      <Route path="communications" element={<NotAvailableYet />} />
      <Route path="communications/email-templates" element={<NotAvailableYet />} />
      <Route path="communications/sms-templates" element={<NotAvailableYet />} />
      <Route path="communications/push" element={<NotAvailableYet />} />
      <Route path="communications/campaigns" element={<NotAvailableYet />} />
      {/* System Settings */}
      <Route path="settings" element={<NotAvailableYet />} />
      <Route path="settings/general" element={<NotAvailableYet />} />
      <Route path="settings/security" element={<NotAvailableYet />} />
      <Route path="settings/notifications" element={<NotAvailableYet />} />
      <Route path="settings/api" element={<NotAvailableYet />} />
      <Route path="settings/payment-gateways" element={<NotAvailableYet />} />
      {/* Admin Management */}
      <Route path="management" element={<NotAvailableYet />} />
      <Route path="management/users" element={<NotAvailableYet />} />
      <Route path="management/roles" element={<NotAvailableYet />} />
      <Route path="management/activity" element={<NotAvailableYet />} />
      {/* Logout */}
      <Route path="logout" element={<NotAvailableYet />} />
      {/* Fallback */}
      <Route path="*" element={<NotAvailableYet />} />
    </Routes>
  );
}
