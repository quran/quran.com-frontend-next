const { setupServer } = require('msw/node');

const { handlers } = require('./handlers');

// This configures a request mocking server with the given request handlers.
const server = setupServer(...handlers);

// Establish API mocking before all tests.
const startMockServer = () => {
  server.listen({
    onUnhandledRequest: 'warn', // Log warnings for unhandled requests
  });
  console.log('MSW: Mock server started');
};

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
const resetMockServer = () => {
  server.resetHandlers();
};

// Clean up after the tests are finished.
const stopMockServer = () => {
  server.close();
  console.log('MSW: Mock server stopped');
};

module.exports = {
  server,
  startMockServer,
  resetMockServer,
  stopMockServer,
};
