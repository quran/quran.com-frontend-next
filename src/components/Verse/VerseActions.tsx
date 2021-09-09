import Verse from 'types/Verse';
// import { useSelector } from 'react-redux';
// import { selectReciter } from 'src/redux/slices/AudioPlayer/state';
import Popover from '../dls/Popover';
import OverflowMenu from '../../../public/icons/menu_more_horiz.svg';
import VerseActionsMenu from './VerseActionsMenu';
// import PlayVerseAudioButton from './PlayVerseAudioButton';
import Button, { ButtonType } from '../dls/Button/Button';

interface Props {
  verse: Verse;
}

const VerseActions: React.FC<Props> = ({ verse }) => (
  // const reciter = useSelector(selectReciter);

  <>
    <div>
      {/* Comment out the audio verse functionality until the backend serves correct data */}
      {/* <PlayVerseAudioButton
          timestamp={verse.timestamps.timestampFrom}
          chapterId={Number(verse.chapterId)}
          reciterId={reciter.id}
        /> */}
    </div>
    <Popover
      trigger={
        <Button tooltip="Actions menu" type={ButtonType.Secondary}>
          <OverflowMenu />
        </Button>
      }
    >
      <VerseActionsMenu verse={verse} />
    </Popover>
  </>
);
export default VerseActions;
