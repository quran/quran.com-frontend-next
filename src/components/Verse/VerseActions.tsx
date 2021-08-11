import { useState } from 'react';
import Verse from 'types/Verse';
import { setCurrentTime } from 'src/redux/slices/AudioPlayer/state';
import { useDispatch } from 'react-redux';
import Dropdown from '../dls/Dropdown/Dropdown';
import OverflowMenu from '../../../public/icons/menu_more_horiz.svg';
import VerseActionsMenu from './VerseActionsMenu';
import VerseActionModal, { VerseActionModalType } from './VerseActionModal';
import styles from './VerseActions.module.scss';
import Button from '../dls/Button/Button';
import PlayIcon from '../../../public/icons/play-circle-outline.svg';

interface Props {
  verse: Verse;
}

const VerseActions: React.FC<Props> = ({ verse }) => {
  const [activeVerseActionModal, setActiveVerseActionModal] = useState<VerseActionModalType>(null);
  const dispatch = useDispatch();

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
      <Button
        icon={<PlayIcon />}
        onClick={() => {
          dispatch(setCurrentTime(10));
        }}
      />
    </>
  );
};

export default VerseActions;
