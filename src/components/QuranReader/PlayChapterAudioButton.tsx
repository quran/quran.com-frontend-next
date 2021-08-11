import { useDispatch } from 'react-redux';
import { loadAudioFile } from 'src/redux/slices/AudioPlayer/state';
import styles from './PlayButton.module.scss';
import Button from '../dls/Button/Button';
import { triggerPlayAudio } from '../AudioPlayer/EventTriggers';

interface Props {
  chapterId: number;
}
const PlayChapterAudioButton = (props: Props) => {
  const dispatch = useDispatch();
  const play = () => {
    dispatch(loadAudioFile(props.chapterId));
    triggerPlayAudio();
  };
  return (
    <div className={styles.container}>
      <Button text="Play" onClick={play} />
    </div>
  );
};

export default PlayChapterAudioButton;
