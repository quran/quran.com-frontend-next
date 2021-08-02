import { useCallback, Dispatch, SetStateAction, ReactNode } from 'react';
import styled from 'styled-components';
import Verse from 'types/Verse';
import Modal from '../dls/Modal/Modal';
import VerseAdvancedCopy from './AdvancedCopy/VerseAdvancedCopy';

export enum VerseActionModalType {
  AdvancedCopy = 'advancedCopy',
}

const MODAL_TYPE_TITLE = {
  [VerseActionModalType.AdvancedCopy]: 'Advance copy options',
};

interface Props {
  verseModalType: VerseActionModalType;
  verse: Verse;
  setVerseModalType: Dispatch<SetStateAction<VerseActionModalType>>;
}

const VerseActionModal: React.FC<Props> = ({ verseModalType, verse, setVerseModalType }) => {
  // handle when the modal is closed.
  const onClose = useCallback(() => {
    setVerseModalType(null);
  }, [setVerseModalType]);

  // no need to render anything to the DOM if the modal is not meant to be visible.
  if (!verseModalType) {
    return null;
  }

  let modalContent: ReactNode;
  // this will be extended to include tafsirs and share
  if (verseModalType === VerseActionModalType.AdvancedCopy) {
    modalContent = <VerseAdvancedCopy verse={verse} />;
  }

  return (
    <Modal
      visible
      title={<TitleContainer>{[MODAL_TYPE_TITLE[verseModalType]]}</TitleContainer>}
      onClose={onClose}
    >
      {modalContent}
    </Modal>
  );
};

const TitleContainer = styled.div`
  font-weight: bold;
`;

export default VerseActionModal;
