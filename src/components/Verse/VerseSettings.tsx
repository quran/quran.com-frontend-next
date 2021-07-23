import Verse from 'types/Verse';
import styled from 'styled-components';
import Dropdown from '../dls/Dropdown/Dropdown';
import MenuMoreIcon from '../../../public/icons/menu_more_horiz.svg';
import VerseSettingsMenu from './VerseSettingsMenu';

interface Props {
  verse: Verse;
}

const VerseSettings: React.FC<Props> = ({ verse }) => (
  <Dropdown overlay={<VerseSettingsMenu verse={verse} />}>
    <IconContainer>
      <MenuMoreIcon />
    </IconContainer>
  </Dropdown>
);

const IconContainer = styled.span`
  cursor: pointer;
`;

export default VerseSettings;
