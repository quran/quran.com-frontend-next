const path = require('path');

module.exports = {
  rootDir: path.join(__dirname, '../..'),
  setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
  displayName: 'client',
  testEnvironment: 'jest-environment-jsdom',
  testMatch: ['<rootDir>/src/**/*.test.(js|jsx|ts|tsx)'],
};
