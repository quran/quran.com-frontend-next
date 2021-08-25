import { useState } from 'react';
import Verse from 'types/Verse';
import { useSelector } from 'react-redux';
import { selectReciter } from 'src/redux/slices/AudioPlayer/state';
import Dropdown from '../dls/Dropdown/Dropdown';
import OverflowMenu from '../../../public/icons/menu_more_horiz.svg';
import VerseActionsMenu from './VerseActionsMenu';
import VerseActionModal, { VerseActionModalType } from './VerseActionModal';
import styles from './VerseActions.module.scss';
import PlayVerseAudioButton from './PlayVerseAudioButton';
import Modal from '../dls/ModalNew/Modal';

interface Props {
  verse: Verse;
}

const VerseActions: React.FC<Props> = ({ verse }) => {
  const [activeVerseActionModal, setActiveVerseActionModal] = useState<VerseActionModalType>(null);
  const reciter = useSelector(selectReciter);

  return (
    <>
      <Dropdown
        overlay={
          <VerseActionsMenu verse={verse} setActiveVerseActionModal={setActiveVerseActionModal} />
        }
      >
        <span className={styles.container}>
          <OverflowMenu />
        </span>
      </Dropdown>
      <Modal title="test" />
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
