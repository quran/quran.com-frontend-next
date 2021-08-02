import { useState, useEffect, SetStateAction, Dispatch } from 'react';
import styled from 'styled-components';
import clipboardCopy from 'clipboard-copy';
import Verse from '../../../types/Verse';
import VerseActionsMenuItem from './VerseActionsMenuItem';
import CopyIcon from '../../../public/icons/copy.svg';
import AdvancedCopyIcon from '../../../public/icons/advanced_copy.svg';
import { VerseActionModalType } from './VerseActionModal';

interface Props {
  verse: Verse;
  setVerseModalType: Dispatch<SetStateAction<VerseActionModalType>>;
}

const VerseActionsMenu: React.FC<Props> = ({ verse, setVerseModalType }) => {
  const [isCopied, setIsCopied] = useState(false);
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    // if the user has just copied the text, we should change the text back to Copy after 3 seconds.
    if (isCopied === true) {
      timeoutId = setTimeout(() => setIsCopied(false), 3 * 1000);
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isCopied]);

  const onCopyClicked = () => {
    clipboardCopy(verse.textUthmani).then(() => {
      setIsCopied(true);
    });
  };

  const onAdvancedCopyClicked = () => {
    setVerseModalType(VerseActionModalType.AdvancedCopy);
  };

  return (
    <>
      <StyledContainer>
        <VerseActionsMenuItem
          title={isCopied ? 'Copied!' : 'Copy'}
          icon={<CopyIcon />}
          onClick={onCopyClicked}
        />
        <VerseActionsMenuItem
          title="Advanced Copy"
          icon={<AdvancedCopyIcon />}
          onClick={onAdvancedCopyClicked}
        />
      </StyledContainer>
    </>
  );
};

const StyledContainer = styled.div`
  width: calc(9 * ${(props) => props.theme.spacing.large});
`;

export default VerseActionsMenu;
