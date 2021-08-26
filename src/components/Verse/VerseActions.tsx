import { useState } from 'react';
import Verse from 'types/Verse';
import { useSelector } from 'react-redux';
import { selectReciter } from 'src/redux/slices/AudioPlayer/state';
import Popover from '../dls/Popover';
import OverflowMenu from '../../../public/icons/menu_more_horiz.svg';
import VerseActionsMenu from './VerseActionsMenu';
import VerseActionModal, { VerseActionModalType } from './VerseActionModal';
import PlayVerseAudioButton from './PlayVerseAudioButton';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '../dls/Button/Button';

interface Props {
  verse: Verse;
}

const VerseActions: React.FC<Props> = ({ verse }) => {
  const [activeVerseActionModal, setActiveVerseActionModal] = useState<VerseActionModalType>(null);
  const reciter = useSelector(selectReciter);

  return (
    <>
      <Popover
        trigger={
          <Button variant={ButtonVariant.Ghost} shape={ButtonShape.Circle} size={ButtonSize.Medium}>
            <OverflowMenu />
          </Button>
        }
      >
        <VerseActionsMenu verse={verse} setActiveVerseActionModal={setActiveVerseActionModal} />
      </Popover>
      <VerseActionModal
        activeVerseActionModal={activeVerseActionModal}
        verse={verse}
        setActiveVerseActionModal={setActiveVerseActionModal}
      />
      <PlayVerseAudioButton
        timestamp={verse.timestamps.timestampFrom}
        chapterId={Number(verse.chapterId)}
        reciterId={reciter.id}
      />
    </>
  );
};

export default VerseActions;
