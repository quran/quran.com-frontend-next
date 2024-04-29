// eslint-disable-next-line import/no-extraneous-dependencies
import {
  AwsRegion,
  renderMediaOnLambda,
  speculateFunctionName,
  renderStillOnLambda,
  RenderMediaOnLambdaInput,
  RenderStillOnLambdaInput,
} from '@remotion/lambda/client';
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

const simplifyQuranData = (data) => {
  const newData = { ...data };

  newData.video = {
    videoSrc: data.video.videoSrc,
    watermarkColor: data.video.watermarkColor,
  };

  // Update verses to only include chapterId and words
  newData.verses = data.verses.map((verse) => ({
    chapterId: verse.chapterId,
    verseKey: verse.verseKey,
    words: verse.words.map((word) => ({
      qpcUthmaniHafs: word.qpcUthmaniHafs,
    })),
    translations: verse.translations.map((translation) => ({
      id: translation.id,
      text: translation.text,
    })),
  }));

  return newData;
};

const RenderRequest = z.object({
  id: z.string(),
  inputProps: COMPOSITION_PROPS,
  type: z.string(),
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

    const inputProps = simplifyQuranData(body.inputProps);
    const { id, type } = body;
    const { verses, audio } = inputProps;
    const { verseKey: startVerseKey } = verses[0];
    const { verseKey: endVerseKey } = verses[verses.length - 1];
    const { reciterId } = audio;
    const fileName = `quran-${reciterId}-${startVerseKey}-${endVerseKey}`;
    const commonProps = {
      functionName: speculateFunctionName({
        diskSizeInMb: DISK,
        memorySizeInMb: RAM,
        timeoutInSeconds: TIMEOUT,
      }),
      region: REGION as AwsRegion,
      serveUrl: SITE_NAME,
      composition: id,
      inputProps,
      concurrencyPerLambda: 2, // {@see https://www.remotion.dev/docs/terminology/concurrency}
    } as RenderMediaOnLambdaInput;

    if (type === 'video') {
      const result = await renderMediaOnLambda({
        ...commonProps,
        codec: 'h264', // {@see https://www.remotion.dev/docs/encoding/#choosing-a-codec}
        crf: 1, // {@see https://www.remotion.dev/docs/encoding/#controlling-quality-using-the-crf-setting}
        framesPerLambda: 10,
        downloadBehavior: {
          type: 'download',
          fileName: `${fileName}.mp4`,
        },
      });

      return result;
    }
    const result = await renderStillOnLambda({
      ...commonProps,
      imageFormat: 'jpeg',
      jpegQuality: 100,
      frame: inputProps?.frame ?? 0,
      privacy: 'public',
      downloadBehavior: {
        type: 'download',
        fileName: `${fileName}-image.jpeg`,
      },
    } as RenderStillOnLambdaInput);

    return result;
  },
);

export default render;
