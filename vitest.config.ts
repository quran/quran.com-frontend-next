/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-underscore-dangle */
import path from 'path';
import { fileURLToPath } from 'url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  root: __dirname,
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['**/src/**/*.test.{js,ts,jsx,tsx}'],
  },
  esbuild: {
    tsconfigRaw: JSON.stringify({
      compilerOptions: {
        paths: {
          '@/icons/*': ['./public/icons/*'],
          '@/public/*': ['./public/*'],
          '@/dls/*': ['./src/components/dls/*'],
          '@/data/*': ['./data/*'],
          '@/styles/*': ['./src/styles/*'],
          '@/types/*': ['./types/*'],
          '@/tests/*': ['./tests/*'],
          '@/*': ['./src/*'],
        },
      },
    }),
  },
  resolve: {
    alias: {
      '@/data': path.resolve(__dirname, './data'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/types': path.resolve(__dirname, './types'),
      '@/redux': path.resolve(__dirname, './src/redux'),
      '@/contexts': path.resolve(__dirname, './src/contexts'),
      '@/styles': path.resolve(__dirname, './src/styles'),
      types: path.resolve(__dirname, './types'),
      src: path.resolve(__dirname, './src'),
      '@/api': path.resolve(__dirname, './src/api.ts'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/*': `${path.resolve(__dirname, './src')}/*`,
      '@/icons': path.resolve(__dirname, './public/icons'),
      '@/dls': path.resolve(__dirname, './src/components/dls'),
    },
  },
});
