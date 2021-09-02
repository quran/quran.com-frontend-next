import Verse from 'types/Verse';
import { useSelector } from 'react-redux';
import { selectReciter } from 'src/redux/slices/AudioPlayer/state';
import Popover from '../dls/Popover';
import OverflowMenu from '../../../public/icons/menu_more_horiz.svg';
import VerseActionsMenu from './VerseActionsMenu';
import PlayVerseAudioButton from './PlayVerseAudioButton';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '../dls/Button/Button';
import styles from './VerseActions.module.scss';

interface Props {
  verse: Verse;
}

const VerseActions: React.FC<Props> = ({ verse }) => {
  const reciter = useSelector(selectReciter);

  return (
    <>
      <div className={styles.playVerseContainer}>
        <PlayVerseAudioButton
          timestamp={verse.timestamps.timestampFrom}
          chapterId={Number(verse.chapterId)}
          reciterId={reciter.id}
        />
      </div>
      <Popover
        trigger={
          <Button
            tooltip="Actions menu"
            variant={ButtonVariant.Ghost}
            shape={ButtonShape.Circle}
            size={ButtonSize.Large}
          >
            <OverflowMenu />
          </Button>
        }
      >
        <VerseActionsMenu verse={verse} />
      </Popover>
    </>
  );
};

export default VerseActions;
