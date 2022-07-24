import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { FiMic } from 'react-icons/fi';

import styles from './PartialResult.module.scss';

import { getVolumeLevelMultiplier } from 'src/audioInput/voice';

interface Props {
  partialTranscript: string;
  volume: number;
  verticalLayout?: boolean;
}

const PartialResult: React.FC<Props> = ({ partialTranscript, volume, verticalLayout }) => {
  const { t } = useTranslation('common');
  return (
    <div className={classNames(styles.outerContainer, verticalLayout && styles.verticalLyaout)}>
      <div className={styles.innerContainer}>
        <div>
          <h3 className={styles.suggestTitle}>{t('voice.suggest-title')}</h3>
          <p className={styles.suggestSubtitle}>{t('voice.suggest-subtitle')}</p>
        </div>
        <div className={styles.circlesContainer}>
          <div
            className={styles.volumeCircle}
            // @ts-ignore
            style={{ '--volume': getVolumeLevelMultiplier(volume) }}
          />
          <div className={styles.micCircle}>
            <FiMic />
          </div>
        </div>
      </div>
      <p className={styles.transcript}>{partialTranscript}</p>
    </div>
  );
};

export default PartialResult;
