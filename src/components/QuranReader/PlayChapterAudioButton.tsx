import { useDispatch } from 'react-redux';

import PlayIcon from '../../../public/icons/play-arrow.svg';

import styles from './PlayButton.module.scss';

import Button, { ButtonSize, ButtonType, ButtonVariant } from 'src/components/dls/Button/Button';
import { loadAndPlayAudioFile } from 'src/redux/slices/AudioPlayer/state';

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
        variant={ButtonVariant.Ghost}
        type={ButtonType.Success}
        size={ButtonSize.Small}
        prefix={<PlayIcon />}
        onClick={play}
        hasSidePadding={false}
      >
        Play Audio
      </Button>
    </div>
  );
};

export default PlayChapterAudioButton;
