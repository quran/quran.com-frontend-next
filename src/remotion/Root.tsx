import { DirectionProvider } from '@radix-ui/react-direction';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { Composition } from 'remotion';

import { VideoContent } from './Video/Main';

import { OnboardingProvider } from '@/components/Onboarding/OnboardingProvider';
import ToastContainerProvider from '@/dls/Toast/ToastProvider';
import ReduxProvider from '@/redux/Provider';
import { getDir } from '@/utils/locale';
import {
  COMPOSITION_NAME,
  VIDEO_FPS,
  VIDEO_LANDSCAPE_HEIGHT,
  VIDEO_LANDSCAPE_WIDTH,
  DEFAULT_PROPS,
} from '@/utils/videoGenerator/constants';
import ThemeProvider from 'src/styles/ThemeProvider';
import { AudioPlayerMachineProvider } from 'src/xstate/AudioPlayerMachineContext';

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
  return (
    <DirectionProvider dir={getDir('en')}>
      <TooltipProvider>
        <ToastContainerProvider>
          <AudioPlayerMachineProvider>
            <ReduxProvider locale="en">
              <ThemeProvider>
                <OnboardingProvider>
                  <Composition
                    id={COMPOSITION_NAME}
                    // @ts-ignore
                    component={VideoContent}
                    durationInFrames={30 * 30}
                    fps={VIDEO_FPS}
                    width={VIDEO_LANDSCAPE_WIDTH}
                    height={VIDEO_LANDSCAPE_HEIGHT}
                    defaultProps={DEFAULT_PROPS}
                  />
                </OnboardingProvider>
              </ThemeProvider>
            </ReduxProvider>
          </AudioPlayerMachineProvider>
        </ToastContainerProvider>
      </TooltipProvider>
    </DirectionProvider>
  );
};
