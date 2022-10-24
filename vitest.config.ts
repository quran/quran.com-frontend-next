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
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '@/data': path.resolve(__dirname, './data'),
    },
  },
});
