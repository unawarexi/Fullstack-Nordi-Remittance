import React from "react";
import { Routes, Route } from "react-router-dom";
import NotAvailableYet from "@components/shared/RenderContent";

// Dashboard
import UserDashboardOverview from "./components/UserOverview";

// Send Money
import DomesticTransfer from "./components/send_money/DomesticTransfer";
import InternationalWire from "./components/send_money/InternationalTransfer";
import QuickTransfer from "./components/send_money/QuickTransfer";
import InstantPayment from "./components/send_money/InstantPayment";

// Profile (existing)
import PersonalInformation from "./components/profile_preferences/Personal_Infomation";
import Communication from "./components/profile_preferences/Communication";
import ClientUserEdit from "./components/profile_preferences/ClientUserEdit";

// Main section pages
import MyAccounts from "./components/MyAccounts";
import Transactions from "./components/Transactions";
import Cards from "./components/Cards";
import Beneficiaries from "./components/Beneficiaries";
import LoansCredits from "./components/Loans_Credits";
import Investments from "./components/Investments";
import SavingGoals from "./components/SavingGoals";

// Account sub-pages
import { SavingsAccount, CurrentAccount, FixedDeposits, AccountStatements } from "./components/accounts/AccountSubPages";

// Transaction sub-pages
import { RecentActivity, ScheduledTransfers, TransactionHistory, DownloadStatement } from "./components/transactions/TransactionSubPages";

// Card sub-pages
import { CardsOverview, CardTransactions, ApplyForCard, CardSecurity, VirtualCards } from "./components/cards/CardSubPages";

// Beneficiary sub-pages
import { AllBeneficiaries, AddBeneficiary, BeneficiaryCategories, RecentRecipients } from "./components/beneficiaries/BeneficiarySubPages";

// Loan sub-pages
import { LoansOverview, ApplyForLoan, LoanCalculator, CreditScore } from "./components/loans/LoanSubPages";

// Investment sub-pages
import { InvestmentOverview, MutualFunds, StocksETFs, FixedIncome, MarketInsights } from "./components/investments/InvestmentSubPages";

// Savings sub-pages
import { SavingsGoalsList, CreateGoal, AutoSaveRules, SavingsAnalytics } from "./components/savings/SavingsSubPages";

// Bills sub-pages
import { PayBills, ScheduledPayments, Utilities, AutopaySetup } from "./components/bills/BillSubPages";

// Forex sub-pages
import { CurrencyExchange, LiveRates, CurrencyAlerts, ExchangeHistory } from "./components/forex/ForexSubPages";

// Mobile sub-pages
import { MobileApp, DeviceManagement, QRPayments, PushNotifications } from "./components/mobile/MobileSubPages";

// Rewards sub-pages
import { MyRewards, RedeemPoints, SpecialOffers, PartnerDiscounts } from "./components/rewards/RewardSubPages";

// Support sub-pages
import { ContactUs, LiveChat, FAQs, ScheduleAppointment } from "./components/support/SupportSubPages";

// Security sub-pages
import { SecuritySettings, TwoFactorAuth, BiometricAccess, ActivityLogs, SecurityAlertsList } from "./components/security/SecuritySubPages";

// Profile sub-pages
import { LanguageRegion, DocumentCenter } from "./components/profile/ProfileSubPages";

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