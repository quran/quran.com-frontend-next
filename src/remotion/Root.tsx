import { Composition } from 'remotion';

import { VideoContent } from './Video/Main';

import {
  VIDEO_FPS,
  VIDEO_LANDSCAPE_HEIGHT,
  VIDEO_LANDSCAPE_WIDTH,
} from '@/utils/videoGenerator/constants';

// eslint-disable-next-line import/prefer-default-export
export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="VideoContent"
        // @ts-ignore
        component={VideoContent}
        durationInFrames={150}
        fps={VIDEO_FPS}
        width={VIDEO_LANDSCAPE_WIDTH}
        height={VIDEO_LANDSCAPE_HEIGHT}
      />
    </>
  );
};
