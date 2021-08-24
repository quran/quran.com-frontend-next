import { useDispatch } from 'react-redux';
import { loadAndPlayAudioFile } from 'src/redux/slices/AudioPlayer/state';
import styles from './PlayButton.module.scss';
import Button, { ButtonVariant } from '../dls/ButtonNew/ButtonNew';

interface Props {
  chapterId: number;
}
const PlayChapterAudioButton = (props: Props) => {
  const dispatch = useDispatch();
  const play = () => {
    dispatch(loadAndPlayAudioFile(props.chapterId));
  };
  return (
    <div className={styles.container}>
      <Button variant={ButtonVariant.Ghost} onClick={play}>
        Play
      </Button>
    </div>
  );
};

export default PlayChapterAudioButton;
