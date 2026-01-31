// ============================================================================
// WAYS TO BANK PAGE
// ============================================================================

import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  WaysHero,
  USSDbanking,
  AccessMoney,
  AmexCard,
  ATMServices,
  Cards,
  FacePay,
  MobileBanking,
  Xtravaganza,
} from "./sections";

// ========================
// MAIN PAGE COMPONENT
// ========================
const WaysToBankPage: React.FC = () => {
  const location = useLocation();

  // Handle hash-based navigation
  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return (
    <main className="overflow-hidden">
      <WaysHero />
      <MobileBanking />
      <USSDbanking />
      <AccessMoney />
      <Cards />
      <ATMServices />
      <AmexCard />
      <FacePay />
      <Xtravaganza />
    </main>
  );
};

export default WaysToBankPage;
