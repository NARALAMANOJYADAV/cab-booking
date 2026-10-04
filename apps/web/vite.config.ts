import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@fairride/types': path.resolve(__dirname, '../../packages/types/src'),
      '@fairride/constants': path.resolve(__dirname, '../../packages/constants/src'),
      '@fairride/shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@fairride/validation': path.resolve(__dirname, '../../packages/validation/src')
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true
      }
    }
  }
});
