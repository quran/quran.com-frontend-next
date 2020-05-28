// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

const path = require("path");

module.exports = {
    testEnvironment: 'jest-environment-jsdom',
    clearMocks: true,
    coverageDirectory: 'coverage',
    moduleDirectories: ['node_modules', path.join(__dirname, 'test')],
    collectCoverageFrom: ['**/src/**/*.test.(js|ts|jsx|tsx)'],
    coverageThreshold: {
        global: {
            statements: 0,
            branches: 0,
            functions: 0,
            lines: 0,
        },
    },
    watchPlugins: [
        'jest-watch-select-projects',
        'jest-watch-typeahead/filename',
        'jest-watch-typeahead/testname',
    ],
    projects: ['./tests/configs/jest.client.js', './tests/configs/jest.lint.js'],
};
