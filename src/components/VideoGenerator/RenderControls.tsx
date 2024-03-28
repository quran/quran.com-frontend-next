import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './video.module.scss';

import Button from '@/dls/Button/Button';
import Progress from '@/dls/Progress';
import { useRendering } from '@/hooks/useRendering';
import IconDownload from '@/icons/download.svg';
import IconRender from '@/icons/slow_motion_video.svg';
import layoutStyle from '@/pages/index.module.scss';
import { COMPOSITION_NAME } from '@/utils/videoGenerator/constants';

export type VideoCompositionProps = {
  video: object;
  verses: object;
  audio: object;
  timestamps: object;
  sceneBackground: object;
  verseBackground: object;
  fontColor: any;
  stls: object;
  verseAlignment: string;
  translationAlignment: string;
  border: string;
};

const RenderControls: React.FC<{
  inputProps: VideoCompositionProps;
}> = ({ inputProps }) => {
  const { t } = useTranslation('common');
  const { renderMedia, state, undo } = useRendering(COMPOSITION_NAME, inputProps);

  return (
    <div
      className={classNames(
        layoutStyle.flowItem,
        layoutStyle.fullWidth,
        styles.renderControlsContainer,
      )}
    >
      {state.status === 'init' || state.status === 'invoking' || state.status === 'error' ? (
        <>
          <Button
            prefix={<IconRender />}
            isDisabled={state.status === 'invoking'}
            isLoading={state.status === 'invoking'}
            onClick={renderMedia}
          >
            {t('video.render-video')}
          </Button>
          {state.status === 'error' ? <div>{state.error.message}</div> : null}
        </>
      ) : null}
      {state.status === 'rendering' || state.status === 'done' ? (
        <>
          <Progress value={state.status === 'rendering' ? state.progress : 1} />
          <br />
          <Button
            prefix={<IconDownload />}
            // @ts-ignore
            isDisabled={state.status === 'invoking'}
            // @ts-ignore
            isLoading={state.status === 'invoking'}
            onClick={renderMedia}
          >
            {t('video.download-video')}
          </Button>
        </>
      ) : null}
    </div>
  );
};

export default RenderControls;
