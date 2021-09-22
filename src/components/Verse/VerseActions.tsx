// import { useSelector } from 'react-redux';
// import { selectReciter } from 'src/redux/slices/AudioPlayer/state';

import OverflowMenu from '../../../public/icons/menu_more_horiz.svg';

import VerseActionsMenu from './VerseActionsMenu';

import Button, { ButtonType } from 'src/components/dls/Button/Button';
import Popover from 'src/components/dls/Popover';
import Verse from 'types/Verse';

// import PlayVerseAudioButton from './PlayVerseAudioButton';

interface Props {
  verse: Verse;
}

const VerseActions: React.FC<Props> = ({ verse }) => (
  <>
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
