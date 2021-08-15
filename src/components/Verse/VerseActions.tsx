import { useState } from 'react';
import Verse from 'types/Verse';
import Dropdown from '../dls/Dropdown/Dropdown';
import OverflowMenu from '../../../public/icons/menu_more_horiz.svg';
import VerseActionsMenu from './VerseActionsMenu';
import VerseActionModal, { VerseActionModalType } from './VerseActionModal';
import styles from './VerseActions.module.scss';
import PlayVerseAudioButton from './PlayVerseAudioButton';

interface Props {
  verse: Verse;
}

const VerseActions: React.FC<Props> = ({ verse }) => {
  const [activeVerseActionModal, setActiveVerseActionModal] = useState<VerseActionModalType>(null);

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
      <VerseActionModal
        activeVerseActionModal={activeVerseActionModal}
        verse={verse}
        setActiveVerseActionModal={setActiveVerseActionModal}
      />
      <PlayVerseAudioButton verse={verse} />
    </>
  );
};

export default VerseActions;
