// ============================================================================
// CONTEXT STORE - Centralized UI state provider composition
// ============================================================================

import React from 'react';
import type { ProviderComponent, ProviderWithProps, ContextStoreProps } from '@types/context.types';
import { NavbarProvider } from './navbar-context';

// ========================
// PROVIDER LIST
// ========================
// Add all your UI context providers here in the order they should be nested.
// Providers at the top of the array will be the outermost wrappers.
const providers: (ProviderComponent | ProviderWithProps)[] = [
  NavbarProvider,
];

// COMPOSE PROVIDERS UTILITY
const composeProviders = (
  providerList: (ProviderComponent | ProviderWithProps)[]
): ProviderComponent => {
  return ({ children }) => {
    return providerList.reduceRight((acc, current) => {
      if (typeof current === 'function') {
        const Provider = current;
        return <Provider>{acc}</Provider>;
      } else {
        const { Provider, props = {} } = current;
        return <Provider {...props}>{acc}</Provider>;
      }
    }, children as React.ReactElement);
  };
};

// CONTEXT STORE COMPONENT
export const ContextStore: React.FC<ContextStoreProps> = ({ children }) => {
  const ComposedProviders = composeProviders(providers);
  return <ComposedProviders>{children}</ComposedProviders>;
};

export { useNavbar } from './navbar-context';
export { NavbarProvider } from './navbar-context';

export default ContextStore;
