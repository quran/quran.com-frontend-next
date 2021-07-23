const path = require('path');

module.exports = {
  stories: ['../src/**/*.stories.tsx'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-links',
    '@storybook/addon-storysource',
    '@storybook/addon-a11y/register',
  ],
  typescript: {
    reactDocgen: false,
  },
  webpackFinal: async (config) => {
    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      use: [
        // {
        //   loader: require.resolve('awesome-typescript-loader'),
        //   options: {
        //     configFileName: path.resolve(__dirname, '../tsconfig.storybook.json'),
        //   },
        // },
        {
          loader: require.resolve('ts-loader'),
          options: {
            configFile: path.resolve(__dirname, '../tsconfig.storybook.json'),
          },
        },
      ],
    });
    config.resolve.extensions.push('.ts', '.tsx', '.css');

    // Add support for absolute paths
     config.resolve.modules = [
    ...(config.resolve.modules || []),
    path.resolve('./'),
  ];
    return config;
  },
};
