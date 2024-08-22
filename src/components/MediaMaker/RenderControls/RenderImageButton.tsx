import React, { MouseEventHandler, useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import MonthlyMediaFileCounter from './MonthlyMediaFileCounter';

import Button from '@/dls/Button/Button';
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
  getCurrentFrame: () => number;
  isFetching: boolean;
};

// TODO: create a common component with RenderVideoButton since most of the component contains the same code.
const RenderImageButton: React.FC<Props> = ({ inputProps, getCurrentFrame, isFetching }) => {
  const { t } = useTranslation('quran-media-maker');
  const { renderMedia, state, undo } = useGenerateMediaFile(inputProps);
  const { data, mutate } = useGetMediaFilesCount(MediaType.IMAGE);
  const [isLimitExceeded, setIsLimitExceeded] = useState(false);
  const previousFrame = useRef<number>();
  const [imageUrl, setImageUrl] = useState('');

  const router = useRouter();
  const downloadButtonRef = React.useRef<HTMLParagraphElement>();

  const triggerRenderImage = () => {
    const frame = getCurrentFrame();
    renderMedia(MediaType.IMAGE, { frame });
    previousFrame.current = frame;
  };

  const onRenderClicked = () => {
    logButtonClick('render_image');
    if (isLoggedIn()) {
      triggerRenderImage();
    } else {
      router.replace(getLoginNavigationUrl(getQuranMediaMakerNavigationUrl()));
    }
  };

  const onDownloadClicked = () => {
    logButtonClick('download_image');
    if (previousFrame.current !== getCurrentFrame()) {
      undo();
      setImageUrl('');
      triggerRenderImage();
    }
  };

  const isInitOrInvokingOrError = [
    RenderStatus.INIT,
    RenderStatus.INVOKING,
    RenderStatus.ERROR,
  ].includes(state.status);

  const isRenderingOrDone = [RenderStatus.RENDERING, RenderStatus.DONE].includes(state.status);

  // listen to state changes and download the file when it's done
  useEffect(() => {
    if (state?.status === RenderStatus.DONE) {
      setImageUrl(state.url);
      mutate(mutateGeneratedMediaCounter, { revalidate: false });
    }

    if (
      state?.status === RenderStatus.ERROR &&
      state?.errorDetails?.code === MediaRenderError.MediaFilesPerUserLimitExceeded
    ) {
      setIsLimitExceeded(true);
    }
  }, [mutate, state?.status, state?.errorDetails?.code, state?.url]);

  useEffect(() => {
    if (imageUrl) {
      // download the file by clicking the download button
      downloadButtonRef.current.click();
    }
  }, [imageUrl]);

  const isRendering = state.status === RenderStatus.RENDERING;
  const isInvoking = state.status === RenderStatus.INVOKING;
  return (
    <div>
      <div>
        {isInitOrInvokingOrError && (
          <>
            <Button
              isDisabled={isFetching || isInvoking}
              isLoading={isFetching || isInvoking}
              onClick={onRenderClicked}
            >
              {t('download-image')}
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
            <Button
              prefix={<IconDownload />}
              isDisabled={isFetching || isRendering}
              isLoading={isFetching || isRendering}
              href={imageUrl}
              onClick={onDownloadClicked}
            >
              <p ref={downloadButtonRef}>{t('download-image')}</p>
            </Button>
          </>
        )}
      </div>
      <MonthlyMediaFileCounter isLimitExceeded={isLimitExceeded} data={data?.data} />
    </div>
  );
};

export default RenderImageButton;
