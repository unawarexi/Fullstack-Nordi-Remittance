// ============================================================================
// BUSINESS BANKING LANDING PAGE
// ============================================================================

import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  BusinessHero,
  BusinessAccounts,
  BusinessLoans,
  CBNHealthcare,
  CashManagement,
  EmergingBusinesses,
  ESolutions,
  FXProducts,
} from "./sections";

const BusinessPage: React.FC = () => {
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
      <BusinessHero />
      <BusinessAccounts />
      <BusinessLoans />
      <ESolutions />
      <CashManagement />
      <FXProducts />
      <CBNHealthcare />
      <EmergingBusinesses />
    </main>
  );
};

export default BusinessPage;
