import { useSelector } from 'react-redux';

import PlayPauseButton from './Buttons/PlayPauseButton';
import styles from './RadioPlaybackControl.module.scss';

import { selectRadioStation } from 'src/redux/slices/radio';

const RadioPlaybackControl = () => {
  const stationState = useSelector(selectRadioStation);
  return (
    <div className={styles.container}>
      <div className={styles.infoContainer}>
        <div className={styles.title}>{stationState.title}</div>
        <div className={styles.description}>{stationState.description}</div>
      </div>
      <PlayPauseButton />
    </div>
  );
};

export default RadioPlaybackControl;
