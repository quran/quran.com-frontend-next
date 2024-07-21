import { lazy } from 'react';

import { Composition, continueRender, delayRender, staticFile } from 'remotion';

import {
  COMPOSITION_NAME,
  DEFAULT_PROPS,
  VIDEO_FPS,
  VIDEO_LANDSCAPE_HEIGHT,
  VIDEO_LANDSCAPE_WIDTH,
} from '@/utils/media/constants';
import { getDurationInFrames, orientationToDimensions } from '@/utils/media/utils';

/**
 * - Make sure API calls are being made in calculate metadata
 * - Install zod(?) and input props and default props are of same type
 */

/**
 * To make things work (e.g. run npx remotion studio), I had to:
 *   - hardcode locale to 'en' in util.ts and chapter.ts
 *   - install scss loaders to make things work - https://www.remotion.dev/docs/webpack#enable-sassscss-support
 *   - install querystring module?
 *   -
 *   -
 *   -
 *   -
 *   -
 */

// eslint-disable-next-line import/prefer-default-export
export const RemotionRoot = () => {
  const waitForFont = delayRender();
  const uthmanicHafsFont = new FontFace(
    `UthmanicHafs`,
    `url('${staticFile('/UthmanicHafs1Ver18.woff2')}') format('woff2')`,
  );
  const surahNamesFont = new FontFace(
    `SurahNames`,
    `url('${staticFile('/SurahNames.woff2')}') format('woff2')`,
  );
  const indopakFont = new FontFace(
    `Indopak`,
    `url('${staticFile('/indopak-nastaleeq-waqf-lazim-v4.2.1.woff2')}') format('woff2')`,
  );

  Promise.all([uthmanicHafsFont.load(), surahNamesFont.load(), indopakFont.load()])
    .then(() => {
      document.fonts.add(uthmanicHafsFont);
      document.fonts.add(surahNamesFont);
      document.fonts.add(indopakFont);
      continueRender(waitForFont);
    })
    .catch((err) => console.log('Error loading font', err));

  const MediaMakerContent = lazy(() => import('./Content'));

  return (
    <Composition
      id={COMPOSITION_NAME}
      // @ts-ignore
      component={MediaMakerContent}
      durationInFrames={getDurationInFrames(DEFAULT_PROPS.timestamps)}
      fps={VIDEO_FPS}
      width={VIDEO_LANDSCAPE_WIDTH}
      height={VIDEO_LANDSCAPE_HEIGHT}
      calculateMetadata={({ props }) => {
        return {
          ...props,
          ...orientationToDimensions(props.orientation),
          durationInFrames: getDurationInFrames(props.timestamps),
        };
      }}
      defaultProps={DEFAULT_PROPS}
    />
  );
};
