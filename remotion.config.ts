import path from 'path';

import { Config } from '@remotion/cli/config';

import getRemotionWebpackConfig from './src/utils/media/webpackConfig.mjs';

Config.setPublicDir(path.join(process.cwd(), 'public', 'publicMin'));

Config.overrideWebpackConfig((config) =>
  getRemotionWebpackConfig(config, {
    stream: require.resolve('stream-browserify'),
    zlib: require.resolve('browserify-zlib'),
    fs: require.resolve('browserify-fs'),
    path: require.resolve('path-browserify'),
  }),
);
