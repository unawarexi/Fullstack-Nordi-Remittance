// ============================================================================
// TEST SETUP FILE
// ============================================================================

import { beforeAll, afterAll, afterEach, vi } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

// Mock environment variables before any imports
process.env.NODE_ENV = 'test';
process.env.PORT = '5001';
process.env.JWT_SECRET = 'test-jwt-secret-key-12345678901234567890';
process.env.JWT_ACCESS_EXPIRY = '15m';
process.env.JWT_REFRESH_EXPIRY = '7d';
process.env.JWT_ISSUER = 'remit-test';
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.REDIS_PASSWORD = '';
process.env.REDIS_DB = '0';
process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
process.env.CLOUDINARY_API_KEY = 'test-api-key';
process.env.CLOUDINARY_API_SECRET = 'test-api-secret';
process.env.SMTP_HOST = 'smtp.test.com';
process.env.SMTP_PORT = '587';
process.env.SMTP_USER = 'test@test.com';
process.env.SMTP_PASSWORD = 'test-password';
process.env.SMTP_FROM_NAME = 'Test';
process.env.SMTP_FROM_EMAIL = 'noreply@test.com';

let mongoServer: MongoMemoryServer | null = null;

// ============================================================================
// GLOBAL TEST SETUP
// ============================================================================

beforeAll(async () => {
  // Create in-memory MongoDB instance with longer timeout
  try {
    mongoServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'remit-test',
      },
      binary: {
        downloadDir: '/tmp/mongodb-binaries',
      },
    });
    const mongoUri = mongoServer.getUri();
    
    // Set the MongoDB URI for tests
    process.env.MONGODB_URI = mongoUri;
    
    // Connect to in-memory database
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,
    });
    
    console.log('Test database connected');
  } catch (error) {
    console.error('Failed to start MongoMemoryServer:', error);
    // Continue without database for unit tests
    process.env.MONGODB_URI = 'mongodb://localhost:27017/remit-test';
  }
}, 60000);

afterAll(async () => {
  // Disconnect and stop MongoDB
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
    console.log('Test database disconnected');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}, 30000);

afterEach(async () => {
  // Clear all collections after each test
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      try {
        await collections[key].deleteMany({});
      } catch {
        // Ignore errors during cleanup
      }
    }
  }
});

// ============================================================================
// GLOBAL MOCKS
// ============================================================================

// Mock email service
vi.mock('../services/Mailer.service.js', () => ({
  sendTemplatedMail: vi.fn().mockResolvedValue(true),
  sendMail: vi.fn().mockResolvedValue(true),
}));

// Mock Redis service
vi.mock('../services/Redis.service.js', () => ({
  default: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue('OK'),
    del: vi.fn().mockResolvedValue(1),
    setex: vi.fn().mockResolvedValue('OK'),
    expire: vi.fn().mockResolvedValue(1),
    incr: vi.fn().mockResolvedValue(1),
    ttl: vi.fn().mockResolvedValue(-2),
  },
  redisClient: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue('OK'),
    del: vi.fn().mockResolvedValue(1),
    setex: vi.fn().mockResolvedValue('OK'),
    expire: vi.fn().mockResolvedValue(1),
    incr: vi.fn().mockResolvedValue(1),
    ttl: vi.fn().mockResolvedValue(-2),
  },
  getBlocked: vi.fn().mockResolvedValue(null),
  setBlocked: vi.fn().mockResolvedValue('OK'),
  getRateLimitInfo: vi.fn().mockResolvedValue(null),
}));

// Mock WebSocket service
vi.mock('../services/Websocket.service.js', () => ({
  initializeWebSocket: vi.fn(),
  emitToUser: vi.fn(),
  emitToRoom: vi.fn(),
  emitToAll: vi.fn(),
}));

// Mock Cloudinary service
vi.mock('../services/Cloudinary.service.js', () => ({
  uploadToCloudinary: vi.fn().mockResolvedValue({
    secure_url: 'https://test-cloudinary.com/image.jpg',
    public_id: 'test-public-id',
  }),
  deleteFromCloudinary: vi.fn().mockResolvedValue({ result: 'ok' }),
}));

// ============================================================================
// HELPER EXPORTS
// ============================================================================

export { mongoServer };
