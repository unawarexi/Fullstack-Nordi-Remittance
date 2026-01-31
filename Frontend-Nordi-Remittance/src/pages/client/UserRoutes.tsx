import React from "react";
import { Routes, Route } from "react-router-dom";
import NotAvailableYet from "@components/shared/RenderContent";
import UserDashboardOverview from "./components/UserOverview";
import DomesticTransfer from "./components/send_money/DomesticTransfer";
import InternationalWire from "./components/send_money/InternationalTransfer";
import QuickTransfer from "./components/send_money/QuickTransfer";
import InstantPayment from "./components/send_money/InstantPayment";
import PersonalInformation from "./components/profile_preferences/Personal_Infomation";
import Communication from "./components/profile_preferences/Communication";

// Main user routes based on UserLeftContainer menuItems
export default function UserRoutes() {
  return (
    <Routes>
      {/* Dashboard */}
      <Route path="dashboard" element={<UserDashboardOverview />} />

      {/* My Accounts */}
      <Route path="accounts" element={<NotAvailableYet />} />
      <Route path="accounts/savings" element={<NotAvailableYet />} />
      <Route path="accounts/current" element={<NotAvailableYet />} />
      <Route path="accounts/fixed-deposits" element={<NotAvailableYet />} />
      <Route path="accounts/statements" element={<NotAvailableYet />} />

      {/* Transactions */}
      <Route path="transactions" element={<NotAvailableYet />} />
      <Route path="transactions/recent" element={<NotAvailableYet />} />
      <Route path="transactions/scheduled" element={<NotAvailableYet />} />
      <Route path="transactions/history" element={<NotAvailableYet />} />
      <Route path="transactions/download" element={<NotAvailableYet />} />

      {/* Send Money */}
      <Route path="send" element={<NotAvailableYet />} />
      <Route path="send/domestic" element={<DomesticTransfer />} />
      <Route path="send/international" element={<InternationalWire />} />
      <Route path="send/quick" element={<QuickTransfer />} />
      <Route path="send/instant" element={<InstantPayment />} />

      {/* Beneficiaries */}
      <Route path="beneficiaries" element={<NotAvailableYet />} />
      <Route path="beneficiaries/all" element={<NotAvailableYet />} />
      <Route path="beneficiaries/add" element={<NotAvailableYet />} />
      <Route path="beneficiaries/categories" element={<NotAvailableYet />} />
      <Route path="beneficiaries/recent" element={<NotAvailableYet />} />

      {/* Cards */}
      <Route path="cards" element={<NotAvailableYet />} />
      <Route path="cards/overview" element={<NotAvailableYet />} />
      <Route path="cards/transactions" element={<NotAvailableYet />} />
      <Route path="cards/apply" element={<NotAvailableYet />} />
      <Route path="cards/security" element={<NotAvailableYet />} />
      <Route path="cards/virtual" element={<NotAvailableYet />} />

      {/* Loans & Credit */}
      <Route path="loans" element={<NotAvailableYet />} />
      <Route path="loans/overview" element={<NotAvailableYet />} />
      <Route path="loans/apply" element={<NotAvailableYet />} />
      <Route path="loans/calculator" element={<NotAvailableYet />} />
      <Route path="loans/credit-score" element={<NotAvailableYet />} />

      {/* Investments */}
      <Route path="investments" element={<NotAvailableYet />} />
      <Route path="investments/overview" element={<NotAvailableYet />} />
      <Route path="investments/mutual-funds" element={<NotAvailableYet />} />
      <Route path="investments/stocks" element={<NotAvailableYet />} />
      <Route path="investments/fixed-income" element={<NotAvailableYet />} />
      <Route path="investments/insights" element={<NotAvailableYet />} />

      {/* Savings Goals */}
      <Route path="savings" element={<NotAvailableYet />} />
      <Route path="savings/goals" element={<NotAvailableYet />} />
      <Route path="savings/create" element={<NotAvailableYet />} />
      <Route path="savings/auto-save" element={<NotAvailableYet />} />
      <Route path="savings/analytics" element={<NotAvailableYet />} />

      {/* Bill Payments */}
      <Route path="bills" element={<NotAvailableYet />} />
      <Route path="bills/pay" element={<NotAvailableYet />} />
      <Route path="bills/scheduled" element={<NotAvailableYet />} />
      <Route path="bills/utilities" element={<NotAvailableYet />} />
      <Route path="bills/autopay" element={<NotAvailableYet />} />

      {/* Foreign Exchange */}
      <Route path="forex" element={<NotAvailableYet />} />
      <Route path="forex/exchange" element={<NotAvailableYet />} />
      <Route path="forex/rates" element={<NotAvailableYet />} />
      <Route path="forex/alerts" element={<NotAvailableYet />} />
      <Route path="forex/history" element={<NotAvailableYet />} />

      {/* Mobile Banking */}
      <Route path="mobile" element={<NotAvailableYet />} />
      <Route path="mobile/app" element={<NotAvailableYet />} />
      <Route path="mobile/devices" element={<NotAvailableYet />} />
      <Route path="mobile/qr" element={<NotAvailableYet />} />
      <Route path="mobile/notifications" element={<NotAvailableYet />} />

      {/* Rewards & Offers */}
      <Route path="rewards" element={<NotAvailableYet />} />
      <Route path="rewards/overview" element={<NotAvailableYet />} />
      <Route path="rewards/redeem" element={<NotAvailableYet />} />
      <Route path="rewards/offers" element={<NotAvailableYet />} />
      <Route path="rewards/partners" element={<NotAvailableYet />} />

      {/* Support */}
      <Route path="support" element={<NotAvailableYet />} />
      <Route path="support/contact" element={<NotAvailableYet />} />
      <Route path="support/chat" element={<NotAvailableYet />} />
      <Route path="support/faqs" element={<NotAvailableYet />} />
      <Route path="support/appointment" element={<NotAvailableYet />} />

      {/* Security Center */}
      <Route path="security" element={<NotAvailableYet />} />
      <Route path="security/settings" element={<NotAvailableYet />} />
      <Route path="security/2fa" element={<NotAvailableYet />} />
      <Route path="security/biometric" element={<NotAvailableYet />} />
      <Route path="security/logs" element={<NotAvailableYet />} />
      <Route path="security/alerts" element={<NotAvailableYet />} />

      {/* Profile & Preferences */}
      <Route path="profile" element={<NotAvailableYet />} />
      <Route path="profile/personal" element={<PersonalInformation />} />
      <Route path="profile/communication" element={<Communication />} />
      <Route path="profile/language" element={<NotAvailableYet />} />
      <Route path="profile/documents" element={<NotAvailableYet />} />

      {/* Logout */}
      <Route path="logout" element={<NotAvailableYet />} />

      {/* Fallback */}
      <Route path="*" element={<NotAvailableYet />} />
    </Routes>
  );
}