// ============================================================================
// CORE MIDDLEWARE TESTS
// ============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createMockRequest,
  createMockResponse,
  createMockNext,
} from '../helpers/test-utils.js';
import {
  requestIdMiddleware,
  requestTimingMiddleware,
  clientIpMiddleware,
  deviceInfoMiddleware,
  notFoundHandler,
  errorHandler,
} from '../../middleware/Core.middleware.js';
import { ValidationError, NotFoundError, UnauthorizedError } from '../../core/errors/AppError.js';

describe('Core Middleware', () => {
  describe('requestIdMiddleware', () => {
    it('should generate request ID if not provided', () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const next = createMockNext();

      requestIdMiddleware(req, res, next);

      expect(req.requestId).toBeDefined();
      expect(res.setHeader).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('should use existing request ID from header', () => {
      const req = createMockRequest({
        headers: {
          'x-request-id': 'existing-request-id',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      requestIdMiddleware(req, res, next);

      expect(req.requestId).toBe('existing-request-id');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('requestTimingMiddleware', () => {
    it('should set start time on request', () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const next = createMockNext();

      requestTimingMiddleware(req, res, next);

      expect(req.startTime).toBeDefined();
      expect(next).toHaveBeenCalled();
    });
  });

  describe('clientIpMiddleware', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const req = createMockRequest({
        headers: {
          'x-forwarded-for': '192.168.1.1, 10.0.0.1',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      clientIpMiddleware(req, res, next);

      expect(req.clientIp).toBe('192.168.1.1');
      expect(next).toHaveBeenCalled();
    });

    it('should extract IP from x-real-ip header', () => {
      const req = createMockRequest({
        headers: {
          'x-real-ip': '192.168.1.100',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      clientIpMiddleware(req, res, next);

      expect(req.clientIp).toBe('192.168.1.100');
      expect(next).toHaveBeenCalled();
    });

    it('should fallback to req.ip', () => {
      const req = createMockRequest() as any;
      req.ip = '127.0.0.1';
      const res = createMockResponse();
      const next = createMockNext();

      clientIpMiddleware(req, res, next);

      expect(req.clientIp).toBeDefined();
      expect(next).toHaveBeenCalled();
    });
  });

  describe('deviceInfoMiddleware', () => {
    it('should detect desktop device', () => {
      const req = createMockRequest({
        headers: {
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      deviceInfoMiddleware(req, res, next);

      expect(req.deviceInfo).toBeDefined();
      expect(req.deviceInfo?.deviceType).toBe('desktop');
      expect(req.deviceInfo?.os).toBe('MacOS');
      expect(req.deviceInfo?.browser).toBe('Chrome');
      expect(next).toHaveBeenCalled();
    });

    it('should detect mobile device', () => {
      const req = createMockRequest({
        headers: {
          'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      deviceInfoMiddleware(req, res, next);

      expect(req.deviceInfo?.deviceType).toBe('mobile');
      expect(req.deviceInfo?.os).toBe('iOS');
      expect(next).toHaveBeenCalled();
    });

    it('should detect Android device', () => {
      const req = createMockRequest({
        headers: {
          'user-agent': 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      deviceInfoMiddleware(req, res, next);

      expect(req.deviceInfo?.deviceType).toBe('mobile');
      expect(req.deviceInfo?.os).toBe('Android');
      expect(next).toHaveBeenCalled();
    });

    it('should detect Windows device', () => {
      const req = createMockRequest({
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      deviceInfoMiddleware(req, res, next);

      expect(req.deviceInfo?.os).toBe('Windows');
      expect(next).toHaveBeenCalled();
    });

    it('should use device ID from header', () => {
      const req = createMockRequest({
        headers: {
          'x-device-id': 'device-123',
          'user-agent': 'test-agent',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      deviceInfoMiddleware(req, res, next);

      expect(req.deviceInfo?.deviceId).toBe('device-123');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('notFoundHandler', () => {
    it('should return 404 for unknown routes', () => {
      const req = createMockRequest({
        method: 'GET',
        originalUrl: '/unknown/route',
      }) as any;
      req.method = 'GET';
      req.originalUrl = '/unknown/route';
      const res = createMockResponse();
      const next = createMockNext();

      notFoundHandler(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('errorHandler', () => {
    it('should handle ValidationError', () => {
      const error = new ValidationError('Invalid input');
      const req = createMockRequest() as any;
      const res = createMockResponse();
      const next = createMockNext();

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
    });

    it('should handle NotFoundError', () => {
      const error = new NotFoundError('User');
      const req = createMockRequest() as any;
      const res = createMockResponse();
      const next = createMockNext();

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle UnauthorizedError', () => {
      const error = new UnauthorizedError('Authentication required');
      const req = createMockRequest() as any;
      const res = createMockResponse();
      const next = createMockNext();

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should handle generic errors', () => {
      const error = new Error('Something went wrong');
      const req = createMockRequest() as any;
      const res = createMockResponse();
      const next = createMockNext();

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should hide error details in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new Error('Internal error details');
      const req = createMockRequest() as any;
      const res = createMockResponse();
      const next = createMockNext();

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);

      process.env.NODE_ENV = originalEnv;
    });
  });
});
