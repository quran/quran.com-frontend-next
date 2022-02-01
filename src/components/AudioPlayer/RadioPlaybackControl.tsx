/* eslint-disable @next/next/no-img-element */
import useCurrentStationInfo from '../Radio/useStationInfo';

import PlayPauseButton from './Buttons/PlayPauseButton';
import styles from './RadioPlaybackControl.module.scss';

const RadioPlaybackControl = () => {
  const stationInfo = useCurrentStationInfo();
  return (
    <div className={styles.container}>
      <div className={styles.leftContainer}>
        <img
          src={stationInfo.imgUrl}
          alt={stationInfo.title}
          className={styles.stationImageContainer}
        />
        <div className={styles.infoContainer}>
          <div className={styles.title}>{stationInfo.title}</div>
          <div className={styles.description}>{stationInfo.description}</div>
        </div>
      </div>
      <PlayPauseButton />
    </div>
  );
};

export default RadioPlaybackControl;
