import React from 'react';

import classNames from 'classnames';
import { useSelector } from 'react-redux';

import Button from '../dls/Button/Button';
import Link from '../dls/Link/Link';

import styles from './FeedbackWidget.module.scss';

import {
  AudioFileStatus,
  selectAudioFileStatus,
  selectIsMobileMinimizedForScrolling,
  selectIsExpanded,
} from 'src/redux/slices/AudioPlayer/state';

const FeedbackWidget = () => {
  const audioPlayerIsExpanded = useSelector(selectIsExpanded);
  const audioFileStatus = useSelector(selectAudioFileStatus);
  const isMobileMinimizedForScrolling = useSelector(selectIsMobileMinimizedForScrolling);
  const isHidden = audioFileStatus === AudioFileStatus.NoFile;
  const isAudioPlayerOpen = !isHidden && !audioPlayerIsExpanded;
  const isAudioPlayerExpanded = !isHidden && audioPlayerIsExpanded;

  return (
    <div
      className={classNames(styles.container, {
        [styles.isMobileMinimizedForScrolling]: isMobileMinimizedForScrolling,
        [styles.audioPlayerOpen]: isAudioPlayerOpen,
        [styles.audioPlayerExpanded]: isAudioPlayerExpanded,
      })}
    >
      <Link href="https://feedback.quran.com" newTab>
        <Button>Feedback</Button>
      </Link>
    </div>
  );
};

export default FeedbackWidget;
