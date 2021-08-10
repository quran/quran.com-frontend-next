const path = require('path');

module.exports = {
  "stories": [
    "../src/**/*.stories.tsx"
  ],
  "addons": [{
      name: '@storybook/preset-scss',
      options: {
        cssLoaderOptions: {
          modules: {
            auto: true
          }
        }
      }
    },
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-a11y"
  ],
  typescript: {
    reactDocgen: false
  },
  "core": {
    "builder": "webpack5"
  },
  webpackFinal: async (config) => {
    // Add support for absolute paths
    config.resolve.modules = [
      ...(config.resolve.modules || []),
      path.resolve('./'),
    ];

    // Return the altered config
    return config;
  },
}