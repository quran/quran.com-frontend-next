import sample from 'lodash/sample';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import PauseIcon from '../../../public/icons/pause.svg';
import PlayIcon from '../../../public/icons/play-arrow.svg';
import { triggerPauseAudio } from '../AudioPlayer/EventTriggers';
import Button from '../dls/Button/Button';
import Link from '../dls/Link/Link';
import curatedStations from '../Radio/curatedStations';
import { StationState, StationType } from '../Radio/types';

import styles from './PlayRadioButton.module.scss';

import { playFrom, selectIsPlaying, selectIsRadioMode } from 'src/redux/slices/AudioPlayer/state';
import { selectRadioStation, setRadioStationState } from 'src/redux/slices/radio';
import { logEvent } from 'src/utils/eventLogger';

const PlayRadioButton = () => {
  const { t } = useTranslation('radio');
  const dispatch = useDispatch();
  const isAudioPlaying = useSelector(selectIsPlaying);
  const isRadioMode = useSelector(selectIsRadioMode);
  const stationState = useSelector(selectRadioStation, shallowEqual);

  const shouldShowStationName = isRadioMode && isAudioPlaying;

  const getPopularStationState = () => {
    const popularStation = curatedStations.popular;
    const randomAudioTrack = sample(popularStation.audioTracks);
    const nextStationState: StationState = {
      id: 'popular',
      type: StationType.Curated,
      title: popularStation.title,
      description: popularStation.description,
      chapterId: randomAudioTrack.chapterId,
      reciterId: randomAudioTrack.reciterId,
    };

    return nextStationState;
  };

  /**
   * If preferred station is not set in redux, set it to the popular station & play the audio
   * otherwise, play the current preferred station
   */
  const onPlayClick = () => {
    const isPreferredStationAvailable = !!stationState?.id;
    const nextStationState = isPreferredStationAvailable ? stationState : getPopularStationState();

    if (!isPreferredStationAvailable) {
      dispatch(setRadioStationState(nextStationState));
    }

    logEvent('play_radio_clicked', {
      stationId: nextStationState.id,
      type: nextStationState.type,
    });

    dispatch(
      playFrom({
        chapterId: Number(nextStationState.chapterId),
        reciterId: Number(nextStationState.reciterId),
        shouldStartFromRandomTimestamp: true,
        isRadioMode: true,
      }),
    );
  };

  const onPauseClick = () => {
    triggerPauseAudio();
  };

  return (
    <div className={styles.container} data-theme="dark">
      <div className={styles.playRadioSection}>
        {isAudioPlaying ? (
          <Button prefix={<PauseIcon />} className={styles.playPauseButton} onClick={onPauseClick}>
            {t('pause-radio')}
          </Button>
        ) : (
          <Button prefix={<PlayIcon />} className={styles.playPauseButton} onClick={onPlayClick}>
            {t('play-radio')}
          </Button>
        )}

        {shouldShowStationName && (
          <div className={styles.stationInfo}>
            <span className={styles.stationTitle}>{stationState.title}</span>
            <Link href="/radio" className={styles.editStationButton}>
              {t('edit')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayRadioButton;
