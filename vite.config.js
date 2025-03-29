import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': {
        target: 'https://auth.recallrai.com/api/v1',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/auth/, '')
      },
      '/app': {
        target: 'https://app.recallrai.com/api/v1',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/app/, '')
      }
    },
  },
});
