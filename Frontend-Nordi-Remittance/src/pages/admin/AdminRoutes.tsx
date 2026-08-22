import React from "react";
import { Routes, Route } from "react-router-dom";
import NotAvailableYet from "@components/shared/RenderContent";

// Dashboard
import AdminOverview from "./app/dashboard/AdminOverview";

// Users
import OverviewUsers from "./app/users/OverviewUsers";
import CreateUser from "./app/users/CreateUser";
import UsersManagement from "./app/users/UsersManagement";
import UserEdit from "./app/users/UserEdit";
import KycPending from "./app/users/KycPending";
import BlockedUsers from "./app/users/BlockedUsers";
import VipUsers from "./app/users/VipUsers";

// Transactions
import Transactions from "./app/transactions/Transactions";
import AllTransactions from "./app/transactions/AllTransactions";
import PendingTransactions from "./app/transactions/PendingTransactions";
import FailedTransactions from "./app/transactions/FailedTransactions";
import InternationalTransactions from "./app/transactions/InternationalTransactions";
import SuspiciousTransactions from "./app/transactions/SuspiciousTransactions";

// KYC
import KycVerification from "./app/kyc/KycVerification";
import PendingKyc from "./app/kyc/PendingKyc";
import VerifiedKyc from "./app/kyc/VerifiedKyc";
import RejectedKyc from "./app/kyc/RejectedKyc";
import EnhancedKyc from "./app/kyc/EnhancedKyc";

// Loans
import LoanApplications from "./app/loans/LoanApplications";
import AllLoans from "./app/loans/AllLoans";
import PendingLoans from "./app/loans/PendingLoans";
import ApprovedLoans from "./app/loans/ApprovedLoans";
import RejectedLoans from "./app/loans/RejectedLoans";
import DelinquentLoans from "./app/loans/DelinquentLoans";

// Investments
import Investments from "./app/investments/Investments";
import AllInvestments from "./app/investments/AllInvestments";
import FixedDeposits from "./app/investments/FixedDeposits";
import MutualFunds from "./app/investments/MutualFunds";
import Bonds from "./app/investments/Bonds";
import Equity from "./app/investments/Equity";

// Accounts & Cards
import AccountsManagement from "./app/accounts/AccountsManagement";
import AdminCards from "./app/cards/AdminCards";
import SavingsAccounts from "./app/accounts/SavingsAccounts";
import CurrentAccounts from "./app/accounts/CurrentAccounts";
import FixedDepositAccounts from "./app/accounts/FixedDepositAccounts";
import DormantAccounts from "./app/accounts/DormantAccounts";
import AccountApplications from "./app/accounts/AccountApplications";
import WalletOperations from "./app/accounts/WalletOperations";

// Forex
import ForexManagement from "./app/forex/ForexManagement";
import ForexRates from "./app/forex/ForexRates";
import ForexTransactions from "./app/forex/ForexTransactions";
import Remittances from "./app/forex/Remittances";

// Reports
import ReportsAnalytics from "./app/reports/ReportsAnalytics";
import FinancialReports from "./app/reports/FinancialReports";
import UserReports from "./app/reports/UserReports";
import TransactionReports from "./app/reports/TransactionReports";
import RiskReports from "./app/reports/RiskReports";
import RegulatoryReports from "./app/reports/RegulatoryReports";

// Fraud
import FraudMonitoring from "./app/fraud/FraudMonitoring";
import FraudAlerts from "./app/fraud/FraudAlerts";
import FraudCases from "./app/fraud/FraudCases";
import AmlMonitoring from "./app/fraud/AmlMonitoring";

// Audit Logs
import AuditLogs from "./app/logs/AuditLogs";

// Communications
import EmailCommunications from "./app/communications/EmailCommunications";
import EmailTemplates from "./app/communications/EmailTemplates";
import SmsTemplates from "./app/communications/SmsTemplates";
import PushNotifications from "./app/communications/PushNotifications";
import Campaigns from "./app/communications/Campaigns";

// Settings
import SystemSettings from "./app/settings/SystemSettings";
import PermissionsSettings from "./app/settings/PermissionsSettings";
import GeneralSettings from "./app/settings/GeneralSettings";
import SecuritySettings from "./app/settings/SecuritySettings";
import NotificationSettings from "./app/settings/NotificationSettings";
import ApiSettings from "./app/settings/ApiSettings";
import PaymentGateways from "./app/settings/PaymentGateways";

// Admin Management
import AdminManagement from "./app/management/AdminManagement";
import ManagementUsers from "./app/management/ManagementUsers";
import ManagementRoles from "./app/management/ManagementRoles";
import ManagementActivity from "./app/management/ManagementActivity";

// Profile
import AdminProfile from "./app/profile/AdminProfile";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="dashboard" element={<AdminOverview />} />
      {/* Users Management */}
      <Route path="users/all" element={<OverviewUsers />} />
      <Route path="users/create" element={<CreateUser />} />
      <Route path="users/:id" element={<UsersManagement />} />
      <Route path="users/:id/edit" element={<UserEdit />} />
      <Route path="users/kyc-pending" element={<KycPending />} />
      <Route path="users/blocked" element={<BlockedUsers />} />
      <Route path="users/vip" element={<VipUsers />} />
      {/* Transactions */}
      <Route path="transactions" element={<Transactions />} />
      <Route path="transactions/all" element={<AllTransactions />} />
      <Route path="transactions/pending" element={<PendingTransactions />} />
      <Route path="transactions/failed" element={<FailedTransactions />} />
      <Route path="transactions/international" element={<InternationalTransactions />} />
      <Route path="transactions/suspicious" element={<SuspiciousTransactions />} />
      {/* KYC / Identity Verification */}
      <Route path="kyc" element={<KycVerification />} />
      <Route path="kyc/pending" element={<PendingKyc />} />
      <Route path="kyc/verified" element={<VerifiedKyc />} />
      <Route path="kyc/rejected" element={<RejectedKyc />} />
      <Route path="kyc/enhanced" element={<EnhancedKyc />} />
      {/* Loan Management */}
      <Route path="loans" element={<LoanApplications />} />
      <Route path="loans/all" element={<AllLoans />} />
      <Route path="loans/pending" element={<PendingLoans />} />
      <Route path="loans/approved" element={<ApprovedLoans />} />
      <Route path="loans/rejected" element={<RejectedLoans />} />
      <Route path="loans/delinquent" element={<DelinquentLoans />} />
      {/* Investment Products */}
      <Route path="investments" element={<Investments />} />
      <Route path="investments/all" element={<AllInvestments />} />
      <Route path="investments/fixed-deposits" element={<FixedDeposits />} />
      <Route path="investments/mutual-funds" element={<MutualFunds />} />
      <Route path="investments/bonds" element={<Bonds />} />
      <Route path="investments/equity" element={<Equity />} />
      {/* Bank Accounts & Cards */}
      <Route path="accounts" element={<AccountsManagement />} />
      <Route path="cards" element={<AdminCards />} />
      <Route path="cards/*" element={<AdminCards />} />
      <Route path="accounts/savings" element={<SavingsAccounts />} />
      <Route path="accounts/current" element={<CurrentAccounts />} />
      <Route path="accounts/fixed-deposits" element={<FixedDepositAccounts />} />
      <Route path="accounts/dormant" element={<DormantAccounts />} />
      <Route path="accounts/applications" element={<AccountApplications />} />
      <Route path="accounts/operations" element={<WalletOperations />} />
      {/* Foreign Exchange */}
      <Route path="forex" element={<ForexManagement />} />
      <Route path="forex/rates" element={<ForexRates />} />
      <Route path="forex/transactions" element={<ForexTransactions />} />
      <Route path="forex/remittances" element={<Remittances />} />
      {/* Reports & Analytics */}
      <Route path="reports" element={<ReportsAnalytics />} />
      <Route path="reports/financial" element={<FinancialReports />} />
      <Route path="reports/users" element={<UserReports />} />
      <Route path="reports/transactions" element={<TransactionReports />} />
      <Route path="reports/risk" element={<RiskReports />} />
      <Route path="reports/regulatory" element={<RegulatoryReports />} />
      {/* Fraud Monitoring */}
      <Route path="fraud" element={<FraudMonitoring />} />
      <Route path="fraud/alerts" element={<FraudAlerts />} />
      <Route path="fraud/cases" element={<FraudCases />} />
      <Route path="fraud/aml" element={<AmlMonitoring />} />
      {/* Audit Logs */}
      <Route path="logs" element={<AuditLogs />} />
      {/* Communications */}
      <Route path="communications" element={<EmailCommunications />} />
      <Route path="communications/email-templates" element={<EmailTemplates />} />
      <Route path="communications/sms-templates" element={<SmsTemplates />} />
      <Route path="communications/push" element={<PushNotifications />} />
      <Route path="communications/campaigns" element={<Campaigns />} />
      {/* System Settings */}
      <Route path="settings" element={<SystemSettings />} />
      <Route path="settings/permissions" element={<PermissionsSettings />} />
      <Route path="settings/general" element={<GeneralSettings />} />
      <Route path="settings/security" element={<SecuritySettings />} />
      <Route path="settings/notifications" element={<NotificationSettings />} />
      <Route path="settings/api" element={<ApiSettings />} />
      <Route path="settings/payment-gateways" element={<PaymentGateways />} />
      {/* Admin Management */}
      <Route path="management" element={<AdminManagement />} />
      <Route path="management/users" element={<ManagementUsers />} />
      <Route path="management/roles" element={<ManagementRoles />} />
      <Route path="management/activity" element={<ManagementActivity />} />
      {/* Profile */}
      <Route path="profile" element={<AdminProfile />} />
      {/* Logout */}
      <Route path="logout" element={<NotAvailableYet />} />
      {/* Fallback */}
      <Route path="*" element={<NotAvailableYet />} />
    </Routes>
  );
}
