// eslint-disable-next-line import/no-extraneous-dependencies
import { AwsRegion, renderMediaOnLambda, speculateFunctionName } from '@remotion/lambda/client';
// eslint-disable-next-line import/no-extraneous-dependencies
import { z } from 'zod';

import { executeApi } from '../../../lambda/api-response';

import {
  COMPOSITION_PROPS,
  DISK,
  RAM,
  REGION,
  SITE_NAME,
  TIMEOUT,
} from '@/utils/videoGenerator/constants';

const RenderRequest = z.object({
  id: z.string(),
  inputProps: COMPOSITION_PROPS,
});

const render = executeApi(
  RenderRequest,
  // eslint-disable-next-line react-func/max-lines-per-function
  async (req, body) => {
    if (req.method !== 'POST') {
      throw new Error('Only POST requests are allowed');
    }

    if (!process.env.AWS_ACCESS_KEY_ID && !process.env.REMOTION_AWS_ACCESS_KEY_ID) {
      throw new TypeError(
        'Set up Remotion Lambda to render videos. See the README.md for how to do so.',
      );
    }
    if (!process.env.AWS_SECRET_ACCESS_KEY && !process.env.REMOTION_AWS_SECRET_ACCESS_KEY) {
      throw new TypeError(
        'The environment variable REMOTION_AWS_SECRET_ACCESS_KEY is missing. Add it to your .env file.',
      );
    }

    const { verses, audio } = body.inputProps;
    const { verseKey: startVerseKey } = verses[0];
    const { verseKey: endVerseKey } = verses[verses.length - 1];
    const { reciterId } = audio;

    const result = await renderMediaOnLambda({
      codec: 'h264', // {@see https://www.remotion.dev/docs/encoding/#choosing-a-codec}
      crf: 1, // {@see https://www.remotion.dev/docs/encoding/#controlling-quality-using-the-crf-setting}
      functionName: speculateFunctionName({
        diskSizeInMb: DISK,
        memorySizeInMb: RAM,
        timeoutInSeconds: TIMEOUT,
      }),
      region: REGION as AwsRegion,
      serveUrl: SITE_NAME,
      composition: body.id,
      inputProps: body.inputProps,
      framesPerLambda: 10,
      downloadBehavior: {
        type: 'download',
        fileName: `quran-${reciterId}-${startVerseKey}-${endVerseKey}.mp4`,
      },
    });

    return result;
  },
);

export default render;
