import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import PauseIcon from '../../../public/icons/pause.svg';
import PlayIcon from '../../../public/icons/play-arrow.svg';
import { triggerPauseAudio } from '../AudioPlayer/EventTriggers';
import Button from '../dls/Button/Button';
import Link from '../dls/Link/Link';
import useCurrentStationInfo from '../Radio/useStationInfo';

import styles from './PlayRadioButton.module.scss';

import { playFrom, selectIsPlaying, selectIsRadioMode } from 'src/redux/slices/AudioPlayer/state';
import { selectRadioStation } from 'src/redux/slices/radio';
import { logEvent } from 'src/utils/eventLogger';

const PlayRadioButton = () => {
  const { t } = useTranslation('radio');
  const dispatch = useDispatch();
  const isAudioPlaying = useSelector(selectIsPlaying);
  const isRadioMode = useSelector(selectIsRadioMode);
  const stationState = useSelector(selectRadioStation, shallowEqual);
  const stationInfo = useCurrentStationInfo();

  const shouldShowStationName = isRadioMode && isAudioPlaying;

  const onPlayClicked = () => {
    logEvent('play_radio_clicked', {
      stationId: stationState.id,
      type: stationState.type,
    });

    dispatch(
      playFrom({
        chapterId: Number(stationState.chapterId),
        reciterId: Number(stationState.reciterId),
        shouldStartFromRandomTimestamp: true,
        isRadioMode: true,
      }),
    );
  };

  const onPauseClicked = () => {
    triggerPauseAudio();
  };

  return (
    <div className={styles.container}>
      <div className={styles.playRadioSection}>
        {isAudioPlaying ? (
          <Button
            prefix={<PauseIcon />}
            onClick={onPauseClicked}
            className={styles.playPauseButton}
          >
            {t('pause-radio')}
          </Button>
        ) : (
          <Button prefix={<PlayIcon />} className={styles.playPauseButton} onClick={onPlayClicked}>
            {t('play-radio')}
          </Button>
        )}

        {shouldShowStationName && (
          <div className={styles.stationInfo}>
            <span className={styles.stationTitle}>{stationInfo.title}</span>{' '}
            <Link href="/radio" className={styles.editStationButton}>
              ({t('change')})
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayRadioButton;
