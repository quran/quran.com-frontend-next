import { useState, useEffect, SetStateAction, Dispatch } from 'react';
import clipboardCopy from 'clipboard-copy';
import { useRouter } from 'next/router';
import { getCurrentPath } from 'src/utils/url';
import Verse from '../../../types/Verse';
import VerseActionsMenuItem from './VerseActionsMenuItem';
import CopyIcon from '../../../public/icons/copy.svg';
import TafsirIcon from '../../../public/icons/tafsir.svg';
import ShareIcon from '../../../public/icons/share.svg';
import AdvancedCopyIcon from '../../../public/icons/advanced_copy.svg';
import { VerseActionModalType } from './VerseActionModal';
import styles from './VerseActionsMenu.module.scss';

interface Props {
  verse: Verse;
  setActiveVerseActionModal: Dispatch<SetStateAction<VerseActionModalType>>;
}

const RESET_COPY_TEXT_TIMEOUT_MS = 3 * 1000;

const VerseActionsMenu: React.FC<Props> = ({ verse, setActiveVerseActionModal }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const router = useRouter();
  const {
    query: { chapterId },
  } = useRouter();
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    // if the user has just copied the text, we should change the text back to Copy after 3 seconds.
    if (isCopied === true) {
      timeoutId = setTimeout(() => setIsCopied(false), RESET_COPY_TEXT_TIMEOUT_MS);
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isCopied]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    // if the user has just copied the link, we should change the text back after 3 seconds.
    if (isShared === true) {
      timeoutId = setTimeout(() => setIsShared(false), RESET_COPY_TEXT_TIMEOUT_MS);
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isShared]);

  const onCopyClicked = () => {
    clipboardCopy(verse.textUthmani).then(() => {
      setIsCopied(true);
    });
  };

  const onAdvancedCopyClicked = () => {
    setActiveVerseActionModal(VerseActionModalType.AdvancedCopy);
  };

  const onTafsirsClicked = () => {
    router.push({
      pathname: '/[chapterId]/[verseId]/tafsirs',
      query: { chapterId, verseId: verse.verseNumber },
    });
  };

  const onShareClicked = () => {
    const path = getCurrentPath();
    if (path) {
      clipboardCopy(path).then(() => {
        setIsShared(true);
      });
    }
  };

  return (
    <>
      <div className={styles.container}>
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
        <VerseActionsMenuItem title="Tafsirs" icon={<TafsirIcon />} onClick={onTafsirsClicked} />
        <VerseActionsMenuItem
          title={isShared ? 'Link has been copied to the clipboard!' : 'Share'}
          icon={<ShareIcon />}
          onClick={onShareClicked}
        />
      </div>
    </>
  );
};

export default VerseActionsMenu;
