// ============================================================================
// CLERK SSO CALLBACK - Handles OAuth redirect back from providers
// ============================================================================

import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";

const SSOCallback = () => {
  return <AuthenticateWithRedirectCallback />;
};

export default SSOCallback;
