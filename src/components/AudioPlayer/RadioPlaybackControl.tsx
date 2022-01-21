import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import PlayPauseButton from './Buttons/PlayPauseButton';
import styles from './RadioPlaybackControl.module.scss';

import { selectRadioStation } from 'src/redux/slices/radio';

const RadioPlaybackControl = () => {
  const stationState = useSelector(selectRadioStation);
  const { t } = useTranslation('radio');
  return (
    <div className={styles.container}>
      <div className={styles.infoContainer}>
        <div className={styles.title}>
          {t(`curated-station.${stationState.title}`, null, { default: stationState.title })}
        </div>
        <div className={styles.description}>
          {t(`curated-station.${stationState.description}`, null, {
            default: stationState.description,
          })}
        </div>
      </div>
      <PlayPauseButton />
    </div>
  );
};

export default RadioPlaybackControl;
