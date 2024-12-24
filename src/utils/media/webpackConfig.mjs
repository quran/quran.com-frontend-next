// eslint-disable-next-line import/no-extraneous-dependencies
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';

const getRemotionWebpackConfig = (webpackConfig, fallback) => {
  return {
    ...webpackConfig,
    resolve: {
      ...webpackConfig.resolve,
      plugins: [...(webpackConfig.resolve?.plugins ?? []), new TsconfigPathsPlugin()],
      fallback: {
        ...webpackConfig.resolve?.fallback,
        ...fallback,
      },
    },
    module: {
      ...webpackConfig.module,
      rules: [
        ...(webpackConfig.module?.rules ? webpackConfig.module.rules : []),
        {
          test: /.s[ac]ss$/i,
          use: [
            { loader: 'style-loader' },
            { loader: 'css-loader' },
            { loader: 'sass-loader', options: { sourceMap: true } },
          ],
        },
      ],
    },
  };
};

export default getRemotionWebpackConfig;
