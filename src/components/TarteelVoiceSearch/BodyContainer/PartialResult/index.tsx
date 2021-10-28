import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import MicrophoneIcon from '../../../../../public/icons/microphone.svg';

import styles from './PartialResult.module.scss';

import { getVolumeLevelMultiplier } from 'src/audioInput/voice';

interface Props {
  partialTranscript: string;
  volume: number;
}

const PartialResult: React.FC<Props> = ({ partialTranscript, volume }) => {
  const { t } = useTranslation('common');
  return (
    <div>
      <div className={styles.container}>
        <p className={styles.speakMessage}>{t('voice.suggest')}</p>
        <div className={styles.circlesContainer}>
          <div
            className={styles.volumeCircle}
            // @ts-ignore
            style={{ '--volume': getVolumeLevelMultiplier(volume) }}
          />
          <div className={styles.micCircle}>
            <MicrophoneIcon />
          </div>
        </div>
      </div>
      <p className={styles.transcript}>{partialTranscript}</p>
    </div>
  );
};

export default PartialResult;
