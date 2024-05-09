import React from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import MonthlyMediaFileCounter from './MonthlyMediaFileCounter';

import Button from '@/dls/Button/Button';
import Progress from '@/dls/Progress';
import { RenderStatus, useGenerateMediaFile } from '@/hooks/auth/media/useGenerateMediaFile';
import IconDownload from '@/icons/download.svg';
import IconRender from '@/icons/slow_motion_video.svg';
import { MediaType } from '@/types/Media/GenerateMediaFileRequest';
import { isLoggedIn } from '@/utils/auth/login';
import { getLoginNavigationUrl, getQuranMediaMakerNavigationUrl } from '@/utils/navigation';

type Props = {
  inputProps: any;
  isFetching: boolean;
};

const RenderVideoButton: React.FC<Props> = ({ inputProps, isFetching }) => {
  const { t } = useTranslation('quran-media-maker');
  const { renderMedia, state } = useGenerateMediaFile(inputProps);
  const router = useRouter();

  const isInitOrInvokingOrError = [
    RenderStatus.INIT,
    RenderStatus.INVOKING,
    RenderStatus.ERROR,
  ].includes(state.status);

  const isRenderingOrDone = [RenderStatus.RENDERING, RenderStatus.DONE].includes(state.status);

  const isRendering = state.status === RenderStatus.RENDERING;
  return (
    <div>
      <MonthlyMediaFileCounter type={MediaType.VIDEO} />
      <div>
        {isInitOrInvokingOrError && (
          <>
            <Button
              prefix={<IconRender />}
              isDisabled={isFetching || state.status === RenderStatus.INVOKING}
              isLoading={isFetching || state.status === RenderStatus.INVOKING}
              onClick={() => {
                if (isLoggedIn()) {
                  renderMedia(MediaType.VIDEO);
                } else {
                  router.replace(getLoginNavigationUrl(getQuranMediaMakerNavigationUrl()));
                }
              }}
            >
              {t('render-video')}
            </Button>
            {state.status === RenderStatus.ERROR && (
              <div>{state?.error?.message || t('common:error.general')}</div>
            )}
          </>
        )}
        {isRenderingOrDone && (
          <>
            <Progress value={isRendering ? state.progress : 100} />
            <br />
            <Button
              prefix={<IconDownload />}
              isDisabled={isFetching || isRendering}
              isLoading={isFetching || isRendering}
              href={state.status === RenderStatus.DONE ? state.url : ''}
            >
              {t('download-video')}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default RenderVideoButton;
