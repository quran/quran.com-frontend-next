import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Verse from '../../../types/Verse';
import VerseSettingsMenuItem from './VerseSettingsMenuItem';
import CopyIcon from '../../../public/icons/copy.svg';

interface Props {
  verse: Verse;
}

const VerseSettingsMenu: React.FC<Props> = ({ verse }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    // if the user has just copied the text, we should change the text back to Copy after 3 seconds.
    if (copied === true) {
      timeoutId = setTimeout(() => setCopied(false), 3 * 1000);
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [copied]);

  const onCopyClicked = () => {
    navigator.clipboard
      .writeText(
        // remove the last element which is the verse's number then join all of them into 1 string
        verse.words
          .slice(0, -1)
          .map((word) => word.text)
          .join(' '),
      )
      .then(() => {
        setCopied(true);
      });
  };

  return (
    <StyledContainer>
      <VerseSettingsMenuItem
        title={copied ? 'Copied!' : 'Copy'}
        icon={<CopyIcon />}
        onClick={onCopyClicked}
      />
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  width: calc(6 * ${(props) => props.theme.spacing.large});
`;

export default VerseSettingsMenu;
