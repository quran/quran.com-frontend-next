import Verse from 'types/Verse';
import { useSelector } from 'react-redux';
import { selectReciter } from 'src/redux/slices/AudioPlayer/state';
import Popover from '../dls/Popover';
import OverflowMenu from '../../../public/icons/menu_more_horiz.svg';
import VerseActionsMenu from './VerseActionsMenu';
import PlayVerseAudioButton from './PlayVerseAudioButton';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '../dls/Button/Button';

interface Props {
  verse: Verse;
}

const VerseActions: React.FC<Props> = ({ verse }) => {
  const reciter = useSelector(selectReciter);

  return (
    <>
      <Popover
        trigger={
          <Button variant={ButtonVariant.Ghost} shape={ButtonShape.Square} size={ButtonSize.Large}>
            <OverflowMenu />
          </Button>
        }
      >
        <VerseActionsMenu verse={verse} />
      </Popover>
      <PlayVerseAudioButton
        timestamp={verse.timestamps.timestampFrom}
        chapterId={Number(verse.chapterId)}
        reciterId={reciter.id}
      />
    </>
  );
};

export default VerseActions;
