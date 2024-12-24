import React, { MutableRefObject, useEffect, useState } from 'react';

import { PlayerRef } from '@remotion/player';
import classNames from 'classnames';
import clipboardCopy from 'clipboard-copy';
import useTranslation from 'next-translate/useTranslation';

import styles from './RenderControls.module.scss';
import RenderImageButton from './RenderImageButton';
import RenderVideoButton from './RenderVideoButton';

import Button, { ButtonType } from '@/dls/Button/Button';
import CopyIcon from '@/icons/copy.svg';
import layoutStyle from '@/pages/index.module.scss';
import { logButtonClick } from '@/utils/eventLogger';
import { getCurrentPath } from '@/utils/url';

type Props = {
  inputProps: MediaFileCompositionProps;
  isFetching: boolean;
  playerRef: MutableRefObject<PlayerRef>;
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

const COPY_TIMEOUT_MS = 3000;

const RenderControls: React.FC<Props> = ({ inputProps, isFetching, playerRef }) => {
  const { t } = useTranslation('media');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    // if the user has just copied the text, we should change the text back to Copy after 3 seconds.
    if (isCopied === true) {
      timeoutId = setTimeout(() => setIsCopied(false), COPY_TIMEOUT_MS);
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isCopied]);

  const onCopyLinkClicked = () => {
    logButtonClick('video_generation_copy_link');
    const path = getCurrentPath();
    if (origin) {
      clipboardCopy(path).then(() => {
        setIsCopied(true);
      });
    }
  };

  return (
    <div className={classNames(layoutStyle.flowItem, layoutStyle.fullWidth, styles.container)}>
      <div>
        <h2 className={styles.lineBackground}>
          <span>{t('download-share')}</span>
        </h2>
      </div>

      <div className={styles.controlsContainer}>
        <RenderVideoButton isFetching={isFetching} inputProps={inputProps} />
        <RenderImageButton isFetching={isFetching} inputProps={inputProps} playerRef={playerRef} />
        <Button
          className={styles.copyButton}
          prefix={<CopyIcon />}
          type={ButtonType.Secondary}
          onClick={onCopyLinkClicked}
        >
          {isCopied ? t('copied') : t('copy-link')}
        </Button>
      </div>
    </div>
  );
};

export default RenderControls;
