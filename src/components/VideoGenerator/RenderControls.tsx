import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './video.module.scss';

import Button from '@/dls/Button/Button';
import Progress from '@/dls/Progress';
import { MediaType, RenderStatus, useRendering } from '@/hooks/useRendering';
import IconDownload from '@/icons/download.svg';
import IconRender from '@/icons/slow_motion_video.svg';
import layoutStyle from '@/pages/index.module.scss';
import { COMPOSITION_NAME } from '@/utils/videoGenerator/constants';

export type VideoCompositionProps = {
  video: object;
  verses: object;
  audio: object;
  timestamps: object;
  fontColor: any;
  stls: object;
  verseAlignment: string;
  translationAlignment: string;
  border: string;
};

const RenderControls: React.FC<{
  inputProps: VideoCompositionProps;
}> = ({ inputProps }) => {
  const { t } = useTranslation('video-generator');
  const { renderMedia, state } = useRendering(COMPOSITION_NAME, inputProps);

  const isInitOrInvokingOrError = [
    RenderStatus.INIT,
    RenderStatus.INVOKING,
    RenderStatus.ERROR,
  ].includes(state.status);

  const isRenderingOrDone = [RenderStatus.RENDERING, RenderStatus.DONE].includes(state.status);

  return (
    <div
      className={classNames(
        layoutStyle.flowItem,
        layoutStyle.fullWidth,
        styles.renderControlsContainer,
      )}
    >
      {isInitOrInvokingOrError && (
        <>
          <Button
            prefix={<IconRender />}
            isDisabled={state.status === RenderStatus.INVOKING}
            isLoading={state.status === RenderStatus.INVOKING}
            onClick={() => {
              renderMedia(MediaType.VIDEO);
            }}
          >
            {t('render-video')}
          </Button>
          {state.status === RenderStatus.ERROR && <div>{state.error.message}</div>}
        </>
      )}
      {isRenderingOrDone && (
        <>
          <Progress value={state.status === RenderStatus.RENDERING ? state.progress * 100 : 100} />
          <br />
          <Button
            prefix={<IconDownload />}
            isDisabled={state.status === RenderStatus.RENDERING}
            isLoading={state.status === RenderStatus.RENDERING}
            href={state.status === RenderStatus.DONE ? state.url : ''}
          >
            {t('download-video')}
          </Button>
        </>
      )}
    </div>
  );
};

export default RenderControls;
