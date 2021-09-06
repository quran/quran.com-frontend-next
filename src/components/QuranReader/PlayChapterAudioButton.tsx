import { useDispatch } from 'react-redux';
import { loadAndPlayAudioFile } from 'src/redux/slices/AudioPlayer/state';
import styles from './PlayButton.module.scss';
import Button, { ButtonSize, ButtonVariant } from '../dls/Button/Button';
import PlayIcon from '../../../public/icons/play-arrow.svg';

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
      <Button
        size={ButtonSize.Small}
        variant={ButtonVariant.Ghost}
        prefix={<PlayIcon />}
        onClick={play}
      >
        Play Audio
      </Button>
    </div>
  );
};

export default PlayChapterAudioButton;
