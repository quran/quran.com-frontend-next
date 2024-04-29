import React from 'react';

import classNames from 'classnames';

import styles from './RenderControls.module.scss';
import RenderImageButton from './RenderImageButton';
import RenderVideoButton from './RenderVideoButton';

import layoutStyle from '@/pages/index.module.scss';

type Props = {
  inputProps: VideoCompositionProps;
  getCurrentFrame: () => void;
};

export type VideoCompositionProps = {
  video: object;
  verses: object;
  audio: object;
  timestamps: object;
  fontColor: any;
  verseAlignment: string;
  translationAlignment: string;
  border: string;
};

const RenderControls: React.FC<Props> = ({ inputProps, getCurrentFrame }) => {
  return (
    <div className={classNames(layoutStyle.flowItem, layoutStyle.fullWidth, styles.container)}>
      <RenderVideoButton inputProps={inputProps} />
      <RenderImageButton inputProps={inputProps} getCurrentFrame={getCurrentFrame} />
    </div>
  );
};

export default RenderControls;
