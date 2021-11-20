import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import styles from './FeedbackWidget.module.scss';

import Button from 'src/components/dls/Button/Button';
import Link from 'src/components/dls/Link/Link';
import {
  AudioDataStatus,
  selectAudioDataStatus,
  selectIsMobileMinimizedForScrolling,
} from 'src/redux/slices/AudioPlayer/state';

const FeedbackWidget = () => {
  const { t } = useTranslation('common');
  const audioDataStatus = useSelector(selectAudioDataStatus);
  const isMobileMinimizedForScrolling = useSelector(selectIsMobileMinimizedForScrolling);
  const isHidden = audioDataStatus === AudioDataStatus.NoFile;

  return (
    <div
      className={classNames(styles.container, {
        [styles.isMobileMinimizedForScrolling]: isMobileMinimizedForScrolling,
        [styles.audioPlayerOpen]: !isHidden,
      })}
    >
      <Link href="https://feedback.quran.com" newTab>
        <Button>{t('feedback')}</Button>
      </Link>
    </div>
  );
};

export default FeedbackWidget;
