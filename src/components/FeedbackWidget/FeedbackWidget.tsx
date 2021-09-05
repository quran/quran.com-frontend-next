import classNames from 'classnames';
import React from 'react';
import { useSelector } from 'react-redux';
import {
  AudioFileStatus,
  selectAudioFileStatus,
  selectVisibility,
  Visibility,
} from 'src/redux/slices/AudioPlayer/state';
import Button from '../dls/Button/Button';
import Link from '../dls/Link/Link';
import styles from './FeedbackWidget.module.scss';

const FeedbackWidget = () => {
  const audioPlayerVisibility = useSelector(selectVisibility);
  const audioFileStatus = useSelector(selectAudioFileStatus);
  const isHidden = audioFileStatus === AudioFileStatus.NoFile;

  const isAudioPlayerOpen = !isHidden && audioPlayerVisibility === Visibility.Default;
  const isAudioPlayerExpanded = !isHidden && audioPlayerVisibility === Visibility.Expanded;

  return (
    <div
      className={classNames(styles.container, {
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
