// ============================================================================
// AUTH ROUTES TESTS
// ============================================================================

import { describe, it, expect } from 'vitest';
import AuthRoutes from '../../routes/Auth.routes.js';

describe('Auth Routes', () => {
  describe('Route Structure', () => {
    it('should export a router', () => {
      expect(AuthRoutes).toBeDefined();
      // Express router should have stack property
      expect(AuthRoutes.stack).toBeDefined();
    });

    it('should have register route', () => {
      const routes = AuthRoutes.stack.filter((layer: any) => 
        layer.route && layer.route.path === '/register'
      );
      expect(routes.length).toBeGreaterThan(0);
    });

    it('should have login route', () => {
      const routes = AuthRoutes.stack.filter((layer: any) => 
        layer.route && layer.route.path === '/login'
      );
      expect(routes.length).toBeGreaterThan(0);
    });

    it('should have logout route', () => {
      const routes = AuthRoutes.stack.filter((layer: any) => 
        layer.route && layer.route.path === '/logout'
      );
      expect(routes.length).toBeGreaterThan(0);
    });

    it('should have refresh route', () => {
      const routes = AuthRoutes.stack.filter((layer: any) => 
        layer.route && layer.route.path === '/refresh'
      );
      expect(routes.length).toBeGreaterThan(0);
    });

    it('should have verify-email route', () => {
      const routes = AuthRoutes.stack.filter((layer: any) => 
        layer.route && layer.route.path === '/verify-email'
      );
      expect(routes.length).toBeGreaterThan(0);
    });

    it('should have forgot-password route', () => {
      const routes = AuthRoutes.stack.filter((layer: any) => 
        layer.route && layer.route.path === '/forgot-password'
      );
      expect(routes.length).toBeGreaterThan(0);
    });

    it('should have reset-password route', () => {
      const routes = AuthRoutes.stack.filter((layer: any) => 
        layer.route && layer.route.path === '/reset-password'
      );
      expect(routes.length).toBeGreaterThan(0);
    });

    it('should have change-password route', () => {
      const routes = AuthRoutes.stack.filter((layer: any) => 
        layer.route && layer.route.path === '/change-password'
      );
      expect(routes.length).toBeGreaterThan(0);
    });

    it('should have me route', () => {
      const routes = AuthRoutes.stack.filter((layer: any) => 
        layer.route && layer.route.path === '/me'
      );
      expect(routes.length).toBeGreaterThan(0);
    });
  });

  describe('HTTP Methods', () => {
    it('should use POST for login', () => {
      const loginRoute = AuthRoutes.stack.find((layer: any) => 
        layer.route && layer.route.path === '/login'
      );
      expect(loginRoute?.route?.methods?.post).toBe(true);
    });

    it('should use POST for register', () => {
      const registerRoute = AuthRoutes.stack.find((layer: any) => 
        layer.route && layer.route.path === '/register'
      );
      expect(registerRoute?.route?.methods?.post).toBe(true);
    });

    it('should use POST for logout', () => {
      const logoutRoute = AuthRoutes.stack.find((layer: any) => 
        layer.route && layer.route.path === '/logout'
      );
      expect(logoutRoute?.route?.methods?.post).toBe(true);
    });

    it('should use GET for me route', () => {
      const meRoute = AuthRoutes.stack.find((layer: any) => 
        layer.route && layer.route.path === '/me'
      );
      expect(meRoute?.route?.methods?.get).toBe(true);
    });
  });
});
