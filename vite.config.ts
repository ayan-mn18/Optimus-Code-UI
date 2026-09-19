import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { validatePublicConfig } from './src/lib/publicConfig';

export default defineConfig(({ mode, command }) => {
  validatePublicConfig(loadEnv(mode, process.cwd(), 'VITE_'), command === 'build');
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },
    server: {
      port: 5173,
    },
    build: { manifest: true, sourcemap: false },
  };
});
