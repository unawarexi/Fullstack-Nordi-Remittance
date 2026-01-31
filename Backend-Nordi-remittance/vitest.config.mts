import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    isolate: true,
    testTimeout: 60000,
    hookTimeout: 60000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'dist/',
        '*.config.*',
        'scripts/',
      ],
      include: [
        'controllers/**/*.ts',
        'middleware/**/*.ts',
        'models/**/*.ts',
        'services/**/*.ts',
        'core/**/*.ts',
        'routes/**/*.ts',
      ],
    },
    include: ['tests/**/*.test.ts', 'tests/**/*.spec.ts'],
    exclude: ['node_modules', 'dist'],
    reporters: ['verbose'],
    sequence: {
      shuffle: false,
    },
    fileParallelism: false,
  },
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './'),
      '@config': path.resolve(__dirname, './config'),
      '@controllers': path.resolve(__dirname, './controllers'),
      '@middleware': path.resolve(__dirname, './middleware'),
      '@models': path.resolve(__dirname, './models'),
      '@services': path.resolve(__dirname, './services'),
      '@core': path.resolve(__dirname, './core'),
      '@routes': path.resolve(__dirname, './routes'),
      '@types': path.resolve(__dirname, './types'),
    },
  },
});
