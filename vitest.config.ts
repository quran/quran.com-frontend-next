/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable import/no-extraneous-dependencies */
import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['**/src/**/*.test.{js,ts,jsx,tsx}'],
  },
  resolve: {
    alias: {
      '@/data': path.resolve(__dirname, './data'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/types': path.resolve(__dirname, './types'),
      '@/redux': path.resolve(__dirname, './src/redux'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/contexts': path.resolve(__dirname, './src/contexts'),
      '@/components': path.resolve(__dirname, './src/components'),
      types: path.resolve(__dirname, './types'),
      '@': path.resolve(__dirname, './src'),
      '@/api': path.resolve(__dirname, './src/api.ts'),
    },
  },
});
