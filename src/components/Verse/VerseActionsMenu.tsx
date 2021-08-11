import { useState, useEffect, SetStateAction, Dispatch } from 'react';
import clipboardCopy from 'clipboard-copy';
import { useRouter } from 'next/router';
import Verse from '../../../types/Verse';
import VerseActionsMenuItem from './VerseActionsMenuItem';
import CopyIcon from '../../../public/icons/copy.svg';
import TafsirIcon from '../../../public/icons/tafsir.svg';
import AdvancedCopyIcon from '../../../public/icons/advanced_copy.svg';
import { VerseActionModalType } from './VerseActionModal';
import styles from './VerseActionsMenu.module.scss';

interface Props {
  verse: Verse;
  setActiveVerseActionModal: Dispatch<SetStateAction<VerseActionModalType>>;
}

const VerseActionsMenu: React.FC<Props> = ({ verse, setActiveVerseActionModal }) => {
  const [isCopied, setIsCopied] = useState(false);
  const router = useRouter();
  const {
    query: { chapterId },
  } = useRouter();
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
    setActiveVerseActionModal(VerseActionModalType.AdvancedCopy);
  };

  const onTafsirsClicked = () => {
    router.push({
      pathname: '/[chapterId]/[verseId]/tafsirs',
      query: { chapterId, verseId: verse.verseNumber },
    });
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
      </div>
    </>
  );
};

export default VerseActionsMenu;
