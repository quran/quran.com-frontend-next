import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

import { deployFunction, deploySite, getOrCreateBucket } from '@remotion/lambda';
// eslint-disable-next-line import/no-extraneous-dependencies
import dotenv from 'dotenv';
// eslint-disable-next-line import/no-extraneous-dependencies
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';

import { RAM, REGION, SITE_NAME, TIMEOUT } from './config.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('dirname is', __dirname);

console.log('Selected region:', REGION);
// TODO: this uploads entire .env file to lambda, which is not ideal
dotenv.config({ path: '.env.local' });

if (!process.env.AWS_ACCESS_KEY_ID && !process.env.REMOTION_AWS_ACCESS_KEY_ID) {
  console.log('The environment variable "REMOTION_AWS_ACCESS_KEY_ID" is not set.');
  console.log('Lambda renders were not set up.');
  console.log('Complete the Lambda setup: at https://www.remotion.dev/docs/lambda/setup');
  process.exit(0);
}
if (!process.env.AWS_SECRET_ACCESS_KEY && !process.env.REMOTION_AWS_SECRET_ACCESS_KEY) {
  console.log('The environment variable "REMOTION_REMOTION_AWS_SECRET_ACCESS_KEY" is not set.');
  console.log('Lambda renders were not set up.');
  console.log('Complete the Lambda setup: at https://www.remotion.dev/docs/lambda/setup');
  process.exit(0);
}

process.stdout.write('Deploying Lambda function... ');

const { functionName, alreadyExisted: functionAlreadyExisted } = await deployFunction({
  createCloudWatchLogGroup: true,
  memorySizeInMb: RAM,
  region: REGION,
  timeoutInSeconds: TIMEOUT,
});
console.log(functionName, functionAlreadyExisted ? '(already existed)' : '(created)');

process.stdout.write('Ensuring bucket... ');
const { bucketName, alreadyExisted: bucketAlreadyExisted } = await getOrCreateBucket({
  region: REGION,
});
console.log(bucketName, bucketAlreadyExisted ? '(already existed)' : '(created)');

process.stdout.write('Deploying site... ');
const { serveUrl } = await deploySite({
  bucketName,
  entryPoint: path.join(process.cwd(), 'src', 'components', 'MediaMaker', 'index.ts'),
  siteName: SITE_NAME,
  region: REGION,
  options: {
    publicDir: path.join(process.cwd(), 'public', 'publicMin'),
    onBundleProgress: (progress) => {
      console.log(`Webpack bundling progress: ${progress}%`);
    },
    // eslint-disable-next-line react-func/max-lines-per-function
    webpackOverride: (webpackConfig) => {
      return {
        ...webpackConfig,
        resolve: {
          ...webpackConfig.resolve,
          plugins: [...(webpackConfig.resolve?.plugins ?? []), new TsconfigPathsPlugin()],
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
    },
  },
});

console.log('Deployed:', serveUrl);

console.log();
console.log('You now have everything you need to render videos!');
console.log('Re-run this command when:');
console.log('  1) you changed the video template');
console.log('  2) you changed config.mjs');
console.log('  3) you upgraded Remotion to a newer version');
