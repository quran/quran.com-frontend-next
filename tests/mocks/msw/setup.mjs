/* eslint-disable import/extensions */
/* eslint-disable import/no-extraneous-dependencies */
// Simple MSW setup for Node.js environment
// This file can be conditionally imported in the Next.js app

import { setupServer } from 'msw/node';

import { handlers } from './handlers.js';

let server = null;

export function startMockServer() {
  if (server) {
    console.log('MSW: Server already running');
    return;
  }

  server = setupServer(...handlers);
  server.listen({
    onUnhandledRequest: 'warn',
  });
  console.log('MSW: Mock server started for testing');
}

export function stopMockServer() {
  if (server) {
    server.close();
    server = null;
    console.log('MSW: Mock server stopped');
  }
}

// Auto-start if in test environment
if (process.env.NODE_ENV === 'test' || process.env.MSW_ENABLED === 'true') {
  startMockServer();
}
