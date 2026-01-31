// ============================================================================
// PERSONAL BANKING PAGE - Main landing page for personal banking services
// ============================================================================

import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  PersonalHero,
  SavingsAccounts,
  Loans,
  Investments,
  CreditCards,
  EverydayAccounts,
  KidsTeens,
  BackToSchool,
  Bancassurance,
  DiasporaBanking,
  DormantAccounts,
} from "./sections";

// CTA Section import from shared components
import { CtaSection } from "../components";

// ========================
// PERSONAL PAGE COMPONENT
// ========================
const PersonalPage: React.FC = () => {
  const location = useLocation();

  // Handle hash-based navigation for section scrolling
  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.slice(1));
      if (element) {
        // Small delay to ensure page is fully rendered
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    } else {
      // Scroll to top if no hash
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location]);

  return (
    <>
      {/* Hero Section */}
      <PersonalHero />

      {/* Savings Accounts */}
      <SavingsAccounts />

      {/* Loans */}
      <Loans />

      {/* Investments */}
      <Investments />

      {/* Credit Cards */}
      <CreditCards />

      {/* Everyday Accounts */}
      <EverydayAccounts />

      {/* Kids & Teens */}
      <KidsTeens />

      {/* Back to School */}
      <BackToSchool />

      {/* Bancassurance */}
      <Bancassurance />

      {/* Diaspora Banking */}
      <DiasporaBanking />

      {/* Dormant Accounts */}
      <DormantAccounts />

      {/* Call to Action */}
      <CtaSection />
    </>
  );
};

export default PersonalPage;
