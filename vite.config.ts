import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Excludes the live SQLite db (server/data/*.db, *.db-wal, *.db-shm) from
      // Vite's watcher. Every chat message writes to that file, and Vite was
      // treating each write as a source change — triggering a full page
      // reload on every message (kicking the user back to Home) and
      // sometimes aborting an in-flight /api/chat request mid-response.
      watch: process.env.DISABLE_HMR === 'true' ? null : {
        ignored: ['**/server/data/**'],
      },
      // Forward API calls to the local Express backend (see PORT in .env).
      proxy: {
        '/api': 'http://localhost:3101',
      },
    },
  };
});
