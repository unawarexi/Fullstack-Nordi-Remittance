// ============================================================================
// PRIVATE BANKING LANDING PAGE
// ============================================================================

import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  PrivateHero,
  PrivateBanker,
  InvestmentManagement,
  ProductsServices,
  BlackCard,
  AboutPrivateBank,
  SponsoredMedicair,
} from "./sections";

const PrivateBankingPage: React.FC = () => {
  const location = useLocation();

  // Hash-based navigation
  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.slice(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location]);

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-900">
      <PrivateHero />
      <PrivateBanker />
      <InvestmentManagement />
      <ProductsServices />
      <BlackCard />
      <AboutPrivateBank />
      <SponsoredMedicair />
    </main>
  );
};

export default PrivateBankingPage;
