"use strict";

module.exports = {
  ci: {
    collect: {
      startServerCommand: "npm run start",
      startServerReadyTimeout: 15000,
      url: [
        "http://localhost:3000/",
        "http://localhost:3000/2/",
        "http://localhost:3000/2/255",
      ],
      numberOfRuns: 2,
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.8 }],
        "categories:accessibility": ["warn", { minScore: 0.8 }],
        "categories:best-practices": ["warn", { minScore: 0.8 }],
        "categories:seo": ["warn", { minScore: 0.8 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
