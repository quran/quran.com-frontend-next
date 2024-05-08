import React from 'react';

import classNames from 'classnames';

import styles from './RenderControls.module.scss';
import RenderImageButton from './RenderImageButton';
import RenderVideoButton from './RenderVideoButton';

import layoutStyle from '@/pages/index.module.scss';

type Props = {
  inputProps: MediaFileCompositionProps;
  getCurrentFrame: () => void;
  isFetching: boolean;
};

export type MediaFileCompositionProps = {
  video: object;
  verses: object;
  audio: object;
  timestamps: object;
  fontColor: any;
  verseAlignment: string;
  translationAlignment: string;
  border: string;
};

const RenderControls: React.FC<Props> = ({ inputProps, getCurrentFrame, isFetching }) => {
  return (
    <div className={classNames(layoutStyle.flowItem, layoutStyle.fullWidth, styles.container)}>
      <RenderVideoButton isFetching={isFetching} inputProps={inputProps} />
      <RenderImageButton
        isFetching={isFetching}
        inputProps={inputProps}
        getCurrentFrame={getCurrentFrame}
      />
    </div>
  );
};

export default RenderControls;
