import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import PlayIcon from '../../../public/icons/play-arrow.svg';

import styles from './PlayButton.module.scss';

import Button, { ButtonSize, ButtonType, ButtonVariant } from 'src/components/dls/Button/Button';
import { loadAndPlayAudioData } from 'src/redux/slices/AudioPlayer/state';
import { logButtonClick } from 'src/utils/eventLogger';

interface Props {
  chapterId: number;
}
const PlayChapterAudioButton: React.FC<Props> = ({ chapterId }) => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const play = () => {
    logButtonClick('chapter_header_play_audio');
    dispatch(loadAndPlayAudioData(chapterId));
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
        shouldFlipOnRTL={false}
      >
        {t('audio.play')}
      </Button>
    </div>
  );
};

export default PlayChapterAudioButton;
