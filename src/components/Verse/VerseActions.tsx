// import { useSelector } from 'react-redux';
// import { selectReciter } from 'src/redux/slices/AudioPlayer/state';

import OverflowMenu from '../../../public/icons/menu_more_horiz.svg';
import Button, { ButtonType } from '../dls/Button/Button';
import Popover from '../dls/Popover';

import VerseActionsMenu from './VerseActionsMenu';

import Verse from 'types/Verse';

// import PlayVerseAudioButton from './PlayVerseAudioButton';

interface Props {
  verse: Verse;
}

const VerseActions: React.FC<Props> = ({ verse }) => (
  // const reciter = useSelector(selectReciter, shallowEqual);

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
