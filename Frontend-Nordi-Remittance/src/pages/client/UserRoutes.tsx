import React from "react";
import { Routes, Route } from "react-router-dom";
import NotAvailableYet from "@components/shared/RenderContent";

// Dashboard
import UserDashboardOverview from "./app/dashboard/UserOverview";

// Accounts
import MyAccounts from "./app/accounts/MyAccounts";
import SavingsAccount from "./app/accounts/SavingsAccount";
import CurrentAccount from "./app/accounts/CurrentAccount";
import FixedDeposits from "./app/accounts/FixedDeposits";
import AccountStatements from "./app/accounts/AccountStatements";

// Transactions
import Transactions from "./app/transactions/Transactions";
import RecentActivity from "./app/transactions/RecentActivity";
import ScheduledTransfers from "./app/transactions/ScheduledTransfers";
import TransactionHistory from "./app/transactions/TransactionHistory";
import DownloadStatement from "./app/transactions/DownloadStatement";

// Send Money
import DomesticTransfer from "./app/send-money/DomesticTransfer";
import InternationalWire from "./app/send-money/InternationalTransfer";
import QuickTransfer from "./app/send-money/QuickTransfer";
import InstantPayment from "./app/send-money/InstantPayment";

// Beneficiaries
import Beneficiaries from "./app/beneficiaries/Beneficiaries";
import AllBeneficiaries from "./app/beneficiaries/AllBeneficiaries";
import AddBeneficiary from "./app/beneficiaries/AddBeneficiary";
import BeneficiaryCategories from "./app/beneficiaries/BeneficiaryCategories";
import RecentRecipients from "./app/beneficiaries/RecentRecipients";

// Cards
import Cards from "./app/cards/Cards";
import CardsOverview from "./app/cards/CardsOverview";
import CardTransactions from "./app/cards/CardTransactions";
import ApplyForCard from "./app/cards/ApplyForCard";
import CardSecurity from "./app/cards/CardSecurity";
import VirtualCards from "./app/cards/VirtualCards";

// Loans & Credit
import LoansCredits from "./app/loans/LoansCredits";
import LoansOverview from "./app/loans/LoansOverview";
import ApplyForLoan from "./app/loans/ApplyForLoan";
import LoanCalculator from "./app/loans/LoanCalculator";
import CreditScore from "./app/loans/CreditScore";

// Investments
import Investments from "./app/investments/Investments";
import InvestmentOverview from "./app/investments/InvestmentOverview";
import MutualFunds from "./app/investments/MutualFunds";
import StocksETFs from "./app/investments/StocksETFs";
import FixedIncome from "./app/investments/FixedIncome";
import MarketInsights from "./app/investments/MarketInsights";

// Savings Goals
import SavingGoals from "./app/savings/SavingGoals";
import SavingsGoalsList from "./app/savings/SavingsGoalsList";
import CreateGoal from "./app/savings/CreateGoal";
import AutoSaveRules from "./app/savings/AutoSaveRules";
import SavingsAnalytics from "./app/savings/SavingsAnalytics";

// Bill Payments
import PayBills from "./app/bills/PayBills";
import ScheduledPayments from "./app/bills/ScheduledPayments";
import Utilities from "./app/bills/Utilities";
import AutopaySetup from "./app/bills/AutopaySetup";

// Foreign Exchange
import CurrencyExchange from "./app/forex/CurrencyExchange";
import LiveRates from "./app/forex/LiveRates";
import CurrencyAlerts from "./app/forex/CurrencyAlerts";
import ExchangeHistory from "./app/forex/ExchangeHistory";

// Mobile Banking
import MobileApp from "./app/mobile/MobileApp";
import DeviceManagement from "./app/mobile/DeviceManagement";
import QRPayments from "./app/mobile/QRPayments";
import PushNotifications from "./app/mobile/PushNotifications";

// Rewards & Offers
import MyRewards from "./app/rewards/MyRewards";
import RedeemPoints from "./app/rewards/RedeemPoints";
import SpecialOffers from "./app/rewards/SpecialOffers";
import PartnerDiscounts from "./app/rewards/PartnerDiscounts";

// Support
import ContactUs from "./app/support/ContactUs";
import LiveChat from "./app/support/LiveChat";
import FAQs from "./app/support/FAQs";
import ScheduleAppointment from "./app/support/ScheduleAppointment";

// Security Center
import SecuritySettings from "./app/security/SecuritySettings";
import TwoFactorAuth from "./app/security/TwoFactorAuth";
import BiometricAccess from "./app/security/BiometricAccess";
import ActivityLogs from "./app/security/ActivityLogs";
import SecurityAlertsList from "./app/security/SecurityAlertsList";

// Profile & Preferences
import PersonalInformation from "./app/profile/PersonalInformation";
import ClientUserEdit from "./app/profile/ClientUserEdit";
import Communication from "./app/profile/Communication";
import LanguageRegion from "./app/profile/LanguageRegion";
import DocumentCenter from "./app/profile/DocumentCenter";

// Main user routes based on UserLeftContainer menuItems
export default function UserRoutes() {
  return (
    <Routes>
      {/* Dashboard */}
      <Route path="dashboard" element={<UserDashboardOverview />} />

      {/* My Accounts */}
      <Route path="accounts" element={<MyAccounts />} />
      <Route path="accounts/savings" element={<SavingsAccount />} />
      <Route path="accounts/current" element={<CurrentAccount />} />
      <Route path="accounts/fixed-deposits" element={<FixedDeposits />} />
      <Route path="accounts/statements" element={<AccountStatements />} />

      {/* Transactions */}
      <Route path="transactions" element={<Transactions />} />
      <Route path="transactions/recent" element={<RecentActivity />} />
      <Route path="transactions/scheduled" element={<ScheduledTransfers />} />
      <Route path="transactions/history" element={<TransactionHistory />} />
      <Route path="transactions/download" element={<DownloadStatement />} />

      {/* Send Money */}
      <Route path="send" element={<DomesticTransfer />} />
      <Route path="send/domestic" element={<DomesticTransfer />} />
      <Route path="send/international" element={<InternationalWire />} />
      <Route path="send/quick" element={<QuickTransfer />} />
      <Route path="send/instant" element={<InstantPayment />} />

      {/* Beneficiaries */}
      <Route path="beneficiaries" element={<Beneficiaries />} />
      <Route path="beneficiaries/all" element={<AllBeneficiaries />} />
      <Route path="beneficiaries/add" element={<AddBeneficiary />} />
      <Route path="beneficiaries/categories" element={<BeneficiaryCategories />} />
      <Route path="beneficiaries/recent" element={<RecentRecipients />} />

      {/* Cards */}
      <Route path="cards" element={<Cards />} />
      <Route path="cards/overview" element={<CardsOverview />} />
      <Route path="cards/transactions" element={<CardTransactions />} />
      <Route path="cards/apply" element={<ApplyForCard />} />
      <Route path="cards/security" element={<CardSecurity />} />
      <Route path="cards/virtual" element={<VirtualCards />} />

      {/* Loans & Credit */}
      <Route path="loans" element={<LoansCredits />} />
      <Route path="loans/overview" element={<LoansOverview />} />
      <Route path="loans/apply" element={<ApplyForLoan />} />
      <Route path="loans/calculator" element={<LoanCalculator />} />
      <Route path="loans/credit-score" element={<CreditScore />} />

      {/* Investments */}
      <Route path="investments" element={<Investments />} />
      <Route path="investments/overview" element={<InvestmentOverview />} />
      <Route path="investments/mutual-funds" element={<MutualFunds />} />
      <Route path="investments/stocks" element={<StocksETFs />} />
      <Route path="investments/fixed-income" element={<FixedIncome />} />
      <Route path="investments/insights" element={<MarketInsights />} />

      {/* Savings Goals */}
      <Route path="savings" element={<SavingGoals />} />
      <Route path="savings/goals" element={<SavingsGoalsList />} />
      <Route path="savings/create" element={<CreateGoal />} />
      <Route path="savings/auto-save" element={<AutoSaveRules />} />
      <Route path="savings/analytics" element={<SavingsAnalytics />} />

      {/* Bill Payments */}
      <Route path="bills" element={<PayBills />} />
      <Route path="bills/pay" element={<PayBills />} />
      <Route path="bills/scheduled" element={<ScheduledPayments />} />
      <Route path="bills/utilities" element={<Utilities />} />
      <Route path="bills/autopay" element={<AutopaySetup />} />

      {/* Foreign Exchange */}
      <Route path="forex" element={<CurrencyExchange />} />
      <Route path="forex/exchange" element={<CurrencyExchange />} />
      <Route path="forex/rates" element={<LiveRates />} />
      <Route path="forex/alerts" element={<CurrencyAlerts />} />
      <Route path="forex/history" element={<ExchangeHistory />} />

      {/* Mobile Banking */}
      <Route path="mobile" element={<MobileApp />} />
      <Route path="mobile/app" element={<MobileApp />} />
      <Route path="mobile/devices" element={<DeviceManagement />} />
      <Route path="mobile/qr" element={<QRPayments />} />
      <Route path="mobile/notifications" element={<PushNotifications />} />

      {/* Rewards & Offers */}
      <Route path="rewards" element={<MyRewards />} />
      <Route path="rewards/overview" element={<MyRewards />} />
      <Route path="rewards/redeem" element={<RedeemPoints />} />
      <Route path="rewards/offers" element={<SpecialOffers />} />
      <Route path="rewards/partners" element={<PartnerDiscounts />} />

      {/* Support */}
      <Route path="support" element={<ContactUs />} />
      <Route path="support/contact" element={<ContactUs />} />
      <Route path="support/chat" element={<LiveChat />} />
      <Route path="support/faqs" element={<FAQs />} />
      <Route path="support/appointment" element={<ScheduleAppointment />} />

      {/* Security Center */}
      <Route path="security" element={<SecuritySettings />} />
      <Route path="security/settings" element={<SecuritySettings />} />
      <Route path="security/2fa" element={<TwoFactorAuth />} />
      <Route path="security/biometric" element={<BiometricAccess />} />
      <Route path="security/logs" element={<ActivityLogs />} />
      <Route path="security/alerts" element={<SecurityAlertsList />} />

      {/* Profile & Preferences */}
      <Route path="profile" element={<PersonalInformation />} />
      <Route path="profile/personal" element={<PersonalInformation />} />
      <Route path="profile/edit" element={<ClientUserEdit />} />
      <Route path="profile/communication" element={<Communication />} />
      <Route path="profile/language" element={<LanguageRegion />} />
      <Route path="profile/documents" element={<DocumentCenter />} />

      {/* Fallback */}
      <Route path="*" element={<NotAvailableYet />} />
    </Routes>
  );
}