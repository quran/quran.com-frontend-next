import { Composition, continueRender, delayRender, staticFile } from 'remotion';

import MediaMakerContent from './Content';

import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import {
  COMPOSITION_NAME,
  DEFAULT_PROPS,
  VIDEO_FPS,
  VIDEO_LANDSCAPE_HEIGHT,
  VIDEO_LANDSCAPE_WIDTH,
} from '@/utils/media/constants';
import { getDurationInFrames, orientationToDimensions } from '@/utils/media/utils';

// eslint-disable-next-line import/prefer-default-export
export const RemotionRoot = () => {
  const waitForFont = delayRender('Downloading fonts...');
  const toast = useToast();

  const uthmanicHafsFont = new FontFace(
    `UthmanicHafs`,
    `url('${staticFile('/UthmanicHafs1Ver18.woff2')}') format('woff2')`,
  );
  const notoNastaliqFont = new FontFace(
    `NotoNastaliq`,
    `url('${staticFile('/NotoNaskhArabic-Regular.woff2')}') format('woff2')`,
  );
  const indopakFont = new FontFace(
    `Indopak`,
    `url('${staticFile('/indopak-nastaleeq-waqf-lazim-v4.2.1.woff2')}') format('woff2')`,
  );
  const proximaVaraFont = new FontFace(
    `ProximaVara`,
    `url('${staticFile('/ProximaVara.woff2')}') format('woff2')`,
  );
  const playfairDisplay = new FontFace(
    'PlayfairDisplay',
    `url('${staticFile('/PlayfairDisplay-Black.ttf')}') format('truetype')`,
  );

  Promise.all([
    uthmanicHafsFont.load(),
    notoNastaliqFont.load(),
    indopakFont.load(),
    proximaVaraFont.load(),
    playfairDisplay.load(),
  ])
    .then(() => {
      document.fonts.add(uthmanicHafsFont);
      document.fonts.add(notoNastaliqFont);
      document.fonts.add(indopakFont);
      document.fonts.add(proximaVaraFont);
      document.fonts.add(playfairDisplay);
      continueRender(waitForFont);
    })
    .catch((err) => {
      toast(err, { status: ToastStatus.Error });
    });

  return (
    <Composition
      id={COMPOSITION_NAME}
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
