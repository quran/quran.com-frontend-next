import { FeedbackFish } from '@feedback-fish/react';
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
import styles from './FeedbackWidget.module.scss';

const FeedbackWidget = () => {
  const audioPlayerVisibility = useSelector(selectVisibility);
  const audioFileStatus = useSelector(selectAudioFileStatus);
  const isHidden = audioFileStatus === AudioFileStatus.NoFile;

  const isAudioPlayerOpen = !isHidden && audioPlayerVisibility === Visibility.Default;
  const isAudioPlayerExpanded = !isHidden && audioPlayerVisibility === Visibility.Expanded;

  return (
    <FeedbackFish projectId="3649f32ef147eb">
      <div
        className={classNames(styles.container, {
          [styles.audioPlayerOpen]: isAudioPlayerOpen,
          [styles.audioPlayerExpanded]: isAudioPlayerExpanded,
        })}
      >
        <Button>Feedback</Button>
      </div>
    </FeedbackFish>
  );
};

export default FeedbackWidget;
