import Verse from 'types/Verse';
import styled from 'styled-components';
import Dropdown from '../dls/Dropdown/Dropdown';
import OverflowMenu from '../../../public/icons/menu_more_horiz.svg';
import VerseActionsMenu from './VerseActionsMenu';

interface Props {
  verse: Verse;
}

const VerseActions: React.FC<Props> = ({ verse }) => (
  <Dropdown overlay={<VerseActionsMenu verse={verse} />}>
    <Container>
      <OverflowMenu />
    </Container>
  </Dropdown>
);

const Container = styled.span`
  cursor: pointer;
`;

export default VerseActions;
