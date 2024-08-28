import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import MonthlyMediaFileCounter from './MonthlyMediaFileCounter';

import Button from '@/dls/Button/Button';
import Progress from '@/dls/Progress';
import { RenderStatus, useGenerateMediaFile } from '@/hooks/auth/media/useGenerateMediaFile';
import useGetMediaFilesCount from '@/hooks/auth/media/useGetMediaFilesCount';
import IconDownload from '@/icons/download.svg';
import { MediaType } from '@/types/Media/GenerateMediaFileRequest';
import MediaRenderError from '@/types/Media/MediaRenderError';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import { mutateGeneratedMediaCounter } from '@/utils/media/utils';
import { getLoginNavigationUrl, getQuranMediaMakerNavigationUrl } from '@/utils/navigation';

type Props = {
  inputProps: any;
  isFetching: boolean;
};

const RenderVideoButton: React.FC<Props> = ({ inputProps, isFetching }) => {
  const { t } = useTranslation('media');
  const { renderMedia, state } = useGenerateMediaFile(inputProps);
  const { data, mutate } = useGetMediaFilesCount(MediaType.VIDEO);
  const downloadButtonRef = React.useRef<HTMLParagraphElement>();
  const router = useRouter();
  const [isLimitExceeded, setIsLimitExceeded] = useState(false);

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
    // listen to state changes and download the file when it's done
    if (state?.status === RenderStatus.DONE) {
      mutate(mutateGeneratedMediaCounter, { revalidate: false });
      // download the file by clicking the download button
      downloadButtonRef.current.click();
    }

    if (
      state?.status === RenderStatus.ERROR &&
      state?.errorDetails?.code === MediaRenderError.MediaFilesPerUserLimitExceeded
    ) {
      setIsLimitExceeded(true);
    }
  }, [mutate, state?.status, state?.errorDetails?.code]);

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
            {state.status === RenderStatus.ERROR && !isLimitExceeded && (
              <div>
                {state?.errorDetails?.code === MediaRenderError.MediaVersesRangeLimitExceeded
                  ? state?.error?.message
                  : t('common:error.general')}
              </div>
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
              <p ref={downloadButtonRef}>{t('download-video')}</p>
            </Button>
          </>
        )}
      </div>
      <MonthlyMediaFileCounter isLimitExceeded={isLimitExceeded} data={data?.data} />
    </div>
  );
};

export default RenderVideoButton;
