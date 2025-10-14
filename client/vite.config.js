import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // ensures paths resolve correctly on deployment
  optimizeDeps: {
    include: ['@apollo/client', 'graphql'],
  },
  server: {
    proxy: {
      "/graphql": {
        target: "https://lasting-bream-91.hasura.app/v1/graphql",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/graphql/, ""),
      },
    },
  },
});
