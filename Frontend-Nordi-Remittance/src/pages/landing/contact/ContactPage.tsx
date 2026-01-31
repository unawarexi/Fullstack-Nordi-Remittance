// ============================================================================
// CONTACT PAGE
// ============================================================================

import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  ContactHero,
  BranchLocator,
  AgencyBanking,
  Biometrics,
  WiFiBranches,
  CustomerFeedback,
  IVRBanking,
  MyAccess,
  WeCare,
} from "./sections";

// ========================
// MAIN PAGE COMPONENT
// ========================
const ContactPage: React.FC = () => {
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
      <ContactHero />
      <BranchLocator />
      <AgencyBanking />
      <MyAccess />
      <IVRBanking />
      <Biometrics />
      <WiFiBranches />
      <CustomerFeedback />
      <WeCare />
    </main>
  );
};

export default ContactPage;
