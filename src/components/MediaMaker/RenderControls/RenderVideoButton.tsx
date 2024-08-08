import React, { useEffect } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import MonthlyMediaFileCounter from './MonthlyMediaFileCounter';

import Button from '@/dls/Button/Button';
import Progress from '@/dls/Progress';
import { RenderStatus, useGenerateMediaFile } from '@/hooks/auth/media/useGenerateMediaFile';
import useGetMediaFilesCount from '@/hooks/auth/media/useGetMediaFilesCount';
import IconDownload from '@/icons/download.svg';
import { MediaType } from '@/types/Media/GenerateMediaFileRequest';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import { mutateGeneratedMediaCounter } from '@/utils/media/utils';
import { getLoginNavigationUrl, getQuranMediaMakerNavigationUrl } from '@/utils/navigation';

type Props = {
  inputProps: any;
  isFetching: boolean;
};

const RenderVideoButton: React.FC<Props> = ({ inputProps, isFetching }) => {
  const { t } = useTranslation('quran-media-maker');
  const { renderMedia, state } = useGenerateMediaFile(inputProps);
  const { data, mutate } = useGetMediaFilesCount(MediaType.VIDEO);
  const router = useRouter();

  const onRenderClicked = () => {
    logButtonClick('render_video');
    if (isLoggedIn()) {
      renderMedia(MediaType.VIDEO);
    } else {
      router.replace(getLoginNavigationUrl(getQuranMediaMakerNavigationUrl()));
    }
  };

  const onDownloadClicked = () => {
    logButtonClick('download_video');
  };

  // listen to state changes and mutate if the render request has resolved successfully
  useEffect(() => {
    if (state?.status === RenderStatus.RENDERING) {
      mutate(mutateGeneratedMediaCounter, { revalidate: false });
    }
  }, [mutate, state?.status]);

  const isInitOrInvokingOrError = [
    RenderStatus.INIT,
    RenderStatus.INVOKING,
    RenderStatus.ERROR,
  ].includes(state.status);

  const isRenderingOrDone = [RenderStatus.RENDERING, RenderStatus.DONE].includes(state.status);

  const isRendering = state.status === RenderStatus.RENDERING;
  return (
    <div>
      <div>
        {isInitOrInvokingOrError && (
          <>
            <Button
              isDisabled={isFetching || state.status === RenderStatus.INVOKING}
              isLoading={isFetching || state.status === RenderStatus.INVOKING}
              onClick={onRenderClicked}
            >
              {t('download-video')}
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
              onClick={onDownloadClicked}
            >
              {t('download-video')}
            </Button>
          </>
        )}
      </div>
      <MonthlyMediaFileCounter data={data?.data} />
    </div>
  );
};

export default RenderVideoButton;
