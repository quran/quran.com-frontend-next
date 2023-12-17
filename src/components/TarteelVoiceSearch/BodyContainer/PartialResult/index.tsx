import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './PartialResult.module.scss';

import MicrophoneIcon from '@/icons/microphone.svg';
import { getVolumeLevelMultiplier } from 'src/audioInput/voice';

interface Props {
  partialTranscript: string;
  volume: number;
  stopRecording: () => void;
  verticalLayout?: boolean;
}

const PartialResult: React.FC<Props> = ({
  partialTranscript,
  volume,
  verticalLayout,
  stopRecording,
}) => {
  const { t } = useTranslation('common');

  return (
    <div className={classNames(styles.outerContainer, verticalLayout && styles.verticalLyaout)}>
      <div className={styles.innerContainer}>
        <div>
          <h3 className={styles.suggestTitle}>{t('voice.suggest-title')}</h3>
          <p className={styles.suggestSubtitle}>{t('voice.suggest-subtitle')}</p>
        </div>
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div className={styles.circlesContainer} onClick={stopRecording}>
          <div
            className={styles.volumeCircle}
            // @ts-ignore
            // eslint-disable-next-line @typescript-eslint/naming-convention
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
