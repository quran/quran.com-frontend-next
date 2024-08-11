import path from 'path';

import { Config } from '@remotion/cli/config';
// eslint-disable-next-line import/no-extraneous-dependencies
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';

Config.setPublicDir(path.join(process.cwd(), 'public', 'publicMin'));

// @ts-ignore
Config.overrideWebpackConfig((config) => {
  return {
    ...config,
    module: {
      ...config.module,
      rules: [
        ...(config.module?.rules ? config.module.rules : []),
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
    resolve: {
      ...config.resolve,
      plugins: [...(config.resolve?.plugins ?? []), new TsconfigPathsPlugin()],
    },
  };
});
