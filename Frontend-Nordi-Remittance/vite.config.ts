// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
  resolve: {
    alias: {
      "@core": path.resolve(__dirname, "src/core"),
      "@components": path.resolve(__dirname, "src/components"),
      "@container": path.resolve(__dirname, "src/container"),
      "@contexts": path.resolve(__dirname, "src/contexts"),
      "@layout": path.resolve(__dirname, "src/layout"),
      "@assets": path.resolve(__dirname, "src/assets"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@pages": path.resolve(__dirname, "src/pages"),
      "@hooks": path.resolve(__dirname, "src/hooks"),
      "@store": path.resolve(__dirname, "src/store"),
      "@constants": path.resolve(__dirname, "src/constants"),
      "@types": path.resolve(__dirname, "src/types"),
    },
  },
}));