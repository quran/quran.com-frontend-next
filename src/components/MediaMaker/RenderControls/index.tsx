import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './RenderControls.module.scss';
import RenderImageButton from './RenderImageButton';
import RenderVideoButton from './RenderVideoButton';

import Button, { ButtonType } from '@/dls/Button/Button';
import IconCopy from '@/icons/copy.svg';
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
  const { t } = useTranslation('quran-media-maker');

  return (
    <div className={classNames(layoutStyle.flowItem, layoutStyle.fullWidth, styles.container)}>
      <div>
        <h2 className={styles.lineBackground}>
          <span>{t('download-share')}</span>
        </h2>
      </div>

      <div className={styles.controlsContainer}>
        <RenderVideoButton isFetching={isFetching} inputProps={inputProps} />
        <RenderImageButton
          isFetching={isFetching}
          inputProps={inputProps}
          getCurrentFrame={getCurrentFrame}
        />
        <Button prefix={<IconCopy />} type={ButtonType.Secondary}>
          {t('copy-link')}
        </Button>
      </div>
    </div>
  );
};

export default RenderControls;
