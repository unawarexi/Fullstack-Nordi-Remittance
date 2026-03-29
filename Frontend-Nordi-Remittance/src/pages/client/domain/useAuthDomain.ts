// ============================================================================
// useAuthDomain — Domain use-case hook for Auth (logout, etc.)
//
// Wraps raw @hooks/queries for container-level auth operations.
// Components import from HERE, never from @hooks/queries/useAuth directly.
// ============================================================================

export { useLogout } from "@hooks/queries/useAuth";
