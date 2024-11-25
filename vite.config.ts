import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  root: path.resolve(__dirname, 'workflow-ide'),
  resolve: {
    alias: {
      flow: path.resolve(__dirname, './flow'),
      traceflow: path.resolve(__dirname, './traceflow'),
      workflow: path.resolve(__dirname, './workflow'),
      'workflow-ide': path.resolve(__dirname, './workflow-ide'),
    },
  },
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, 'dist/workflow-ide'),
  },
});
