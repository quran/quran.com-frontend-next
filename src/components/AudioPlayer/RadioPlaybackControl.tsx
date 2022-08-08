import { useActor } from '@xstate/react';

import PlayPauseButton from './Buttons/PlayPauseButton';
import styles from './RadioPlaybackControl.module.scss';

import useCurrentStationInfo from 'src/xstate/Radio/useCurrentStationInfo';

const RadioPlaybackControl = ({ radioActor }) => {
  const [radioService] = useActor(radioActor);
  const stationInfo = useCurrentStationInfo((radioService as any).context);
  return (
    <div className={styles.container}>
      <div className={styles.infoContainer}>
        <div className={styles.title}>{stationInfo.title}</div>
        <div className={styles.description}>{stationInfo.description}</div>
      </div>
      <PlayPauseButton />
    </div>
  );
};

export default RadioPlaybackControl;
