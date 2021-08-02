import { useState } from 'react';
import Verse from 'types/Verse';
import styled from 'styled-components';
import Dropdown from '../dls/Dropdown/Dropdown';
import OverflowMenu from '../../../public/icons/menu_more_horiz.svg';
import VerseActionsMenu from './VerseActionsMenu';
import VerseActionModal, { VerseActionModalType } from './VerseActionModal';

interface Props {
  verse: Verse;
}

const VerseActions: React.FC<Props> = ({ verse }) => {
  const [verseModalType, setVerseModalType] = useState<VerseActionModalType>(null);

  return (
    <>
      <Dropdown overlay={<VerseActionsMenu verse={verse} setVerseModalType={setVerseModalType} />}>
        <Container>
          <OverflowMenu />
        </Container>
      </Dropdown>
      <VerseActionModal
        verseModalType={verseModalType}
        verse={verse}
        setVerseModalType={setVerseModalType}
      />
    </>
  );
};

const Container = styled.span`
  cursor: pointer;
`;

export default VerseActions;
