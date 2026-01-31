// ============================================================================
// CORPORATE BANKING LANDING PAGE
// ============================================================================

import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  CorporateHero,
  CorporateFinance,
  CorporateCashManagement,
  TreasuryServices,
  CorporateSector,
  DistributorsForum,
  EconomicResearch,
  ExportersForum,
  CorporateLoans,
} from "./sections";

const CorporatePage: React.FC = () => {
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
    <main className="min-h-screen bg-white">
      <CorporateHero />
      <CorporateFinance />
      <CorporateCashManagement />
      <TreasuryServices />
      <CorporateSector />
      <DistributorsForum />
      <EconomicResearch />
      <ExportersForum />
      <CorporateLoans />
    </main>
  );
};

export default CorporatePage;
