import mongoose, { ConnectOptions } from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const uri = process.env.MONGODB_URI as string;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    const isProduction = process.env.NODE_ENV === 'production';

    await mongoose.connect(uri, {
      // Connection pool — tune based on expected concurrency
      maxPoolSize: isProduction ? 50 : 10,
      minPoolSize: isProduction ? 10 : 2,
      // Timeouts
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      // Keep connections alive to prevent idle socket closure
      heartbeatFrequencyMS: 10000,
      // CRITICAL: Disable autoIndex in production — indexes should be created
      // via migration script (scripts/create-indexes.ts), not at runtime.
      // Runtime index creation blocks the event loop on large collections.
      autoIndex: !isProduction,
      // Auto-create collections (safe in all environments)
      autoCreate: true,
      // Retry writes for transient network errors
      retryWrites: true,
      retryReads: true,
      // Write concern for financial data integrity
      w: 'majority',
    } as ConnectOptions);

    console.log(
      `✅ MongoDB connected successfully [pool: ${isProduction ? 50 : 10}, autoIndex: ${!isProduction}]`,
    );

    // Connection event handlers
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    // Log slow queries in development
    if (!isProduction) {
      mongoose.set('debug', (collectionName: string, method: string, query: any) => {
        if (process.env.MONGOOSE_DEBUG === 'true') {
          console.log(`🔍 Mongoose: ${collectionName}.${method}`, JSON.stringify(query));
        }
      });
    }
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error}`);
    process.exit(1);
  }
};

const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    throw error;
  }
};

export { connectDB, disconnectDB };
