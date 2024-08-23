import React, { useEffect, useRef } from 'react';

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
  getIsPlayerPlaying: () => boolean;
  isFetching: boolean;
};

// TODO: create a common component with RenderVideoButton since most of the component contains the same code.
const RenderImageButton: React.FC<Props> = ({
  inputProps,
  getCurrentFrame,
  getIsPlayerPlaying,
  isFetching,
}) => {
  const { t } = useTranslation('quran-media-maker');
  const { renderMedia, state, undo } = useGenerateMediaFile(inputProps);
  const { data, mutate } = useGetMediaFilesCount(MediaType.IMAGE);
  const previousFrame = useRef<number>();
  const router = useRouter();
  const downloadButtonRef = React.useRef<HTMLParagraphElement>();

  const triggerRenderImage = () => {
    const frame = getCurrentFrame();
    renderMedia(MediaType.IMAGE, { frame });
    previousFrame.current = frame;
  };

  const isRendering = state.status === RenderStatus.RENDERING;
  const isInvoking = state.status === RenderStatus.INVOKING;
  const isDone = state.status === RenderStatus.DONE;

  const isInitOrInvokingOrError = [
    RenderStatus.INVOKING,
    RenderStatus.INIT,
    RenderStatus.ERROR,
  ].includes(state.status);
  const isRenderingOrDone = [RenderStatus.RENDERING, RenderStatus.DONE].includes(state.status);

  const onRenderOrDownloadClicked = (e: React.MouseEvent<HTMLParagraphElement>) => {
    if (isInitOrInvokingOrError) {
      logButtonClick('render_image');
      if (isLoggedIn()) {
        triggerRenderImage();
      } else {
        router.replace(getLoginNavigationUrl(getQuranMediaMakerNavigationUrl()));
      }
    } else if (isRenderingOrDone) {
      logButtonClick('download_image');
      const isFrameDifferent = previousFrame.current !== getCurrentFrame();
      const isPlaying = getIsPlayerPlaying();
      if (isPlaying && isFrameDifferent) {
        undo();
      } else if (!isPlaying && isFrameDifferent) {
        e.preventDefault();
        undo();
        triggerRenderImage();
      }
    }
  };

  const isError = state?.status === RenderStatus.ERROR;

  // listen to state changes and download the file when it's done
  useEffect(() => {
    if (state?.status === RenderStatus.DONE) {
      downloadButtonRef.current.click();
      previousFrame.current = getCurrentFrame();
      mutate(mutateGeneratedMediaCounter, { revalidate: false });
    }
  }, [getCurrentFrame, mutate, state?.status]);

  return (
    <div>
      <div>
        <Button
          prefix={<IconDownload />}
          isDisabled={isFetching || isInvoking || isRendering}
          isLoading={isFetching || isInvoking}
          onClick={onRenderOrDownloadClicked}
          {...(isDone && state.url && { href: state.url })}
        >
          <p ref={downloadButtonRef}>{t('download-image')}</p>
        </Button>
        {isError &&
          state?.errorDetails?.code !== MediaRenderError.MediaFilesPerUserLimitExceeded && (
            <div>
              {state?.errorDetails?.code === MediaRenderError.MediaVersesRangeLimitExceeded
                ? state?.error?.message
                : t('common:error.general')}
            </div>
          )}
      </div>
      <MonthlyMediaFileCounter
        isLimitExceeded={
          isError && state?.errorDetails?.code === MediaRenderError.MediaFilesPerUserLimitExceeded
        }
        data={data?.data}
      />
    </div>
  );
};

export default RenderImageButton;
