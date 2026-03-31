import { lazy } from "react";
import { Route, Routes } from "react-router-dom";

// Landing page components (direct import for critical path)
import {
  HeroCarousel,
  FeatureSections,
  CtaSection,
  TeamSection,
} from "@pages/landing/components";

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
const Auth = lazy(() => import("@pages/auth/ExportAuth"));

// Landing Page Routes - Lazy loaded
const PersonalPage = lazy(() => import("@pages/landing/personal/PersonalPage"));
const BusinessPage = lazy(() => import("@pages/landing/business/BusinessPage"));
const CorporatePage = lazy(
  () => import("@pages/landing/corporate/CorporatePage"),
);
const PrivateBankingPage = lazy(
  () => import("@pages/landing/private-banking/PrivateBankingPage"),
);
const WaysToBankPage = lazy(
  () => import("@pages/landing/ways-to-bank/WaysToBankPage"),
);
const ContactPage = lazy(() => import("@pages/landing/contact/ContactPage"));

/**
 * LandingPage component - Aggregates all landing page sections
 */
function LandingPage() {
  return (
    <>
      <HeroCarousel />
      <QuickLinks />
      <Statistics />
      <Products />
      <FeatureSections />
      <AccountTypes />
      <CompareCards />
      <BankingServices />
      <InterestRates />
      <DigitalBanking />
      <MobileApp />
      <Security />
      <Rewards />
      <BusinessBanking />
      <FinancialTools />
      <Testimonials />
      <Locations />
      <Banner />
      <News />
      <Partners />
      <TeamSection />
      <Support />
      <Helpful_tools />
      <CtaSection />
    </>
  );
}

/**
 * LandingRoutes component - Defines all public/landing routes
 */
export const LandingRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/personal/*" element={<PersonalPage />} />
      <Route path="/business/*" element={<BusinessPage />} />
      <Route path="/corporate/*" element={<CorporatePage />} />
      <Route path="/private-banking/*" element={<PrivateBankingPage />} />
      <Route path="/ways-to-bank/*" element={<WaysToBankPage />} />
      <Route path="/contact/*" element={<ContactPage />} />
      <Route path="/auth/:page" element={<Auth />} />
    </Routes>
  );
};

export default LandingRoutes;
