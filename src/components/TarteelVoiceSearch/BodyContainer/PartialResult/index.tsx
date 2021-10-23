import React from 'react';

import MicrophoneIcon from '../../../../../public/icons/microphone.svg';

import styles from './PartialResult.module.scss';

import { getVolumeCircleMultiplier } from 'src/utils/voice';

interface Props {
  partialTranscriptText: string;
  volume: number;
}

const PartialResult: React.FC<Props> = ({ partialTranscriptText, volume }) => {
  return (
    <div>
      <div className={styles.container}>
        <p className={styles.speakMessage}>Please begin reciting and your verse will appear.</p>
        <div className={styles.circlesContainer}>
          <div
            className={styles.volumeCircle}
            // @ts-ignore
            style={{ '--volume': getVolumeCircleMultiplier(volume) }}
          />
          <div className={styles.micCircle}>
            <MicrophoneIcon />
          </div>
        </div>
      </div>
      <p className={styles.transcriptText}>{partialTranscriptText}</p>
    </div>
  );
};

export default PartialResult;
