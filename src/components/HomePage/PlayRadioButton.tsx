import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import PauseIcon from '../../../public/icons/pause.svg';
import PlayIcon from '../../../public/icons/play-arrow.svg';
import { triggerPauseAudio } from '../AudioPlayer/EventTriggers';
import Button, { ButtonVariant } from '../dls/Button/Button';
import Link from '../dls/Link/Link';

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
    <div className={styles.container} data-theme="dark">
      <div className={styles.playRadioSection}>
        {isAudioPlaying ? (
          <Button
            prefix={<PauseIcon />}
            variant={ButtonVariant.Ghost}
            onClick={onPauseClicked}
            className={styles.playPauseButton}
          >
            {t('pause-radio')}
          </Button>
        ) : (
          <Button
            prefix={<PlayIcon />}
            className={styles.playPauseButton}
            variant={ButtonVariant.Ghost}
            onClick={onPlayClicked}
          >
            {t('play-radio')}
          </Button>
        )}

        {shouldShowStationName && (
          <div className={styles.stationInfo}>
            <span className={styles.stationTitle}>
              {t(`curated-station.${stationState.title}`, null, { default: stationState.title })}
            </span>
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
