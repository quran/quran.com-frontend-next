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
    // Default rule for images /\.(svg|ico|jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|cur|ani|pdf)(\?.*)?$/
    const fileLoaderRule = config.module.rules.find(rule => rule.test && rule.test.test && rule.test.test('.svg'));
    // we should exclude handling .svg files by file-loader.
    fileLoaderRule.exclude = /\.svg$/;  
    // and add our own loader (@svgr/webpack)
    config.module.rules.push({
      test: /\.svg$/,
      enforce: 'pre',
      loader: require.resolve('@svgr/webpack'),
    });
    // add a loader to handle ts|tsx files.
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
