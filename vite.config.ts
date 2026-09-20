import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? (process.env.BASE_PATH || './') : '/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    open: false,
  },
}));

