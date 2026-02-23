import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";

// Core imports
import MainLayout from "@layout/MainLayout";
import ToastContainer from "@components/ui/ToastContainer";
import { ErrorBoundary } from "@components/shared/ErrorBoundary";
import { PageLoader } from "@components/ui/Spinner";
import ThemeProvider from "@contexts/ThemeProvider";
import "./App.css";

// Landing page components (direct import for critical path)
import { HeroCarousel, FeatureSections, CtaSection, TeamSection } from "@pages/landing/components";

// Legacy section imports
import BankingServices from "@pages/landing/sections/Services";
import Banner from "@pages/landing/sections/Banner";
import Helpful_tools from "@pages/landing/sections/Helpful_tools";

// New dense landing page sections
import Statistics from "@pages/landing/sections/Statistics";
import Testimonials from "@pages/landing/sections/Testimonials";
import Security from "@pages/landing/sections/Security";
import Products from "@pages/landing/sections/Products";
import MobileApp from "@pages/landing/sections/MobileApp";
import Partners from "@pages/landing/sections/Partners";
import News from "@pages/landing/sections/News";
import AccountTypes from "@pages/landing/sections/AccountTypes";
import InterestRates from "@pages/landing/sections/InterestRates";
import Locations from "@pages/landing/sections/Locations";
import Support from "@pages/landing/sections/Support";
import Rewards from "@pages/landing/sections/Rewards";
import DigitalBanking from "@pages/landing/sections/DigitalBanking";
import QuickLinks from "@pages/landing/sections/QuickLinks";
import FinancialTools from "@pages/landing/sections/FinancialTools";
import BusinessBanking from "@pages/landing/sections/BusinessBanking";
import CompareCards from "@pages/landing/sections/CompareCards";

// Lazy load non-critical routes
const ConfirmID = lazy(() => import("@pages/landing/sections/confirmation/ConfirmID"));
const Auth = lazy(() => import("@pages/auth/ExportAuth"));
const AdminLogin = lazy(() => import("@pages/auth/admin/AdminLogin"));
const AdminMainLayout = lazy(() => import("@pages/admin/app/AdminMainLayout"));
const UserMainLayout = lazy(() => import("@pages/client/app/UserMainLayout"));

// Landing Page Routes - Lazy loaded
const PersonalPage = lazy(() => import("@pages/landing/personal/PersonalPage"));
const BusinessPage = lazy(() => import("@pages/landing/business/BusinessPage"));
const CorporatePage = lazy(() => import("@pages/landing/corporate/CorporatePage"));
const PrivateBankingPage = lazy(() => import("@pages/landing/private-banking/PrivateBankingPage"));
const WaysToBankPage = lazy(() => import("@pages/landing/ways-to-bank/WaysToBankPage"));
const ContactPage = lazy(() => import("@pages/landing/contact/ContactPage"));

// ============================================================================
// LANDING PAGE COMPONENT
// ============================================================================
function LandingPage() {
  return (
    <>
      {/* Hero Section */}
      <HeroCarousel />
      
      {/* Quick Links - Easy access to popular services */}
      <QuickLinks />
      
      {/* Statistics - Trust indicators */}
      <Statistics />
      
      {/* Products Grid - All banking products overview */}
      <Products />
      
      {/* Feature Sections - Key benefits */}
      <FeatureSections />
      
      {/* Account Types Comparison */}
      <AccountTypes />
      
      {/* Credit Cards Comparison */}
      <CompareCards />
      
      {/* Banking Services Slider */}
      <BankingServices />
      
      {/* Interest Rates Display */}
      <InterestRates />
      
      {/* Digital Banking Features */}
      <DigitalBanking />
      
      {/* Mobile App Promotion */}
      <MobileApp />
      
      {/* Security Features */}
      <Security />
      
      {/* Rewards Program */}
      <Rewards />
      
      {/* Business Banking Solutions */}
      <BusinessBanking />
      
      {/* Financial Tools & Calculators */}
      <FinancialTools />
      
      {/* Customer Testimonials */}
      <Testimonials />
      
      {/* Locations & ATM Finder */}
      <Locations />
      
      {/* Banner with Service Cards */}
      <Banner />
      
      {/* News & Updates */}
      <News />
      
      {/* Partners & Awards */}
      <Partners />
      
      {/* Team Section */}
      <TeamSection />
      
      {/* Customer Support Section */}
      <Support />
      
      {/* Helpful Tools */}
      <Helpful_tools />
      
      {/* CTA Section */}
      <CtaSection />
    </>
  );
}

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router basename="/">
          {/* Global Toast Notifications */}
          <ToastContainer />
          
          <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public/MainLayout routes */}
            <Route
              path="/*"
              element={
                <MainLayout>
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/personal/*" element={<PersonalPage />} />
                    <Route path="/business/*" element={<BusinessPage />} />
                    <Route path="/corporate/*" element={<CorporatePage />} />
                    <Route path="/private-banking/*" element={<PrivateBankingPage />} />
                    <Route path="/ways-to-bank/*" element={<WaysToBankPage />} />
                    <Route path="/contact/*" element={<ContactPage />} />
                    <Route path="/auth/:page" element={<Auth />} />
                    <Route path="/verification" element={<ConfirmID />} />
                  </Routes>
                </MainLayout>
              }
            />
            
            {/* Admin routes */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/*" element={<AdminMainLayout />} />
            
            {/* Customer dashboard routes */}
            <Route path="/customer/*" element={<UserMainLayout />} />
          </Routes>
        </Suspense>
      </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
