import { useState, useEffect, SetStateAction, Dispatch } from 'react';
import clipboardCopy from 'clipboard-copy';
import { useRouter } from 'next/router';
import { getWindowOrigin } from 'src/utils/url';
import { useDispatch, useSelector } from 'react-redux';
import {
  Bookmarks,
  selectBookmarks,
  toggleVerseBookmark,
} from 'src/redux/slices/QuranReader/bookmarks';
import Verse from '../../../types/Verse';
import VerseActionsMenuItem from './VerseActionsMenuItem';
import CopyIcon from '../../../public/icons/copy.svg';
import TafsirIcon from '../../../public/icons/tafsir.svg';
import ShareIcon from '../../../public/icons/share.svg';
import BookmarkedIcon from '../../../public/icons/bookmark.svg';
import UnBookmarkedIcon from '../../../public/icons/unbookmarked.svg';
import AdvancedCopyIcon from '../../../public/icons/advanced_copy.svg';
import { VerseActionModalType } from './VerseActionModal';
import styles from './VerseActionsMenu.module.scss';
import Modal from '../dls/ModalNew/Modal';

interface Props {
  verse: Verse;
  setActiveVerseActionModal: Dispatch<SetStateAction<VerseActionModalType>>;
}

const RESET_COPY_TEXT_TIMEOUT_MS = 3 * 1000;

const VerseActionsMenu: React.FC<Props> = ({ verse, setActiveVerseActionModal }) => {
  const dispatch = useDispatch();
  const { bookmarkedVerses } = useSelector(selectBookmarks) as Bookmarks;
  const [isCopied, setIsCopied] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const router = useRouter();
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
      query: { chapterId: verse.chapterId, verseId: verse.verseNumber },
    });
  };

  const onShareClicked = () => {
    const origin = getWindowOrigin();
    if (origin) {
      clipboardCopy(`${origin}/${verse.chapterId}/${verse.verseNumber}`).then(() => {
        setIsShared(true);
      });
    }
  };

  const onToggleBookmarkClicked = () => {
    dispatch({ type: toggleVerseBookmark.type, payload: verse.verseKey });
  };

  const isVerseBookmarked = !!bookmarkedVerses[verse.verseKey];
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
        <Modal title="test" />
        <VerseActionsMenuItem title="Tafsirs" icon={<TafsirIcon />} onClick={onTafsirsClicked} />
        <VerseActionsMenuItem
          title={isShared ? 'Link has been copied to the clipboard!' : 'Share'}
          icon={<ShareIcon />}
          onClick={onShareClicked}
        />
        <VerseActionsMenuItem
          title={isVerseBookmarked ? 'Bookmarked!' : 'Bookmark'}
          icon={isVerseBookmarked ? <BookmarkedIcon /> : <UnBookmarkedIcon />}
          onClick={onToggleBookmarkClicked}
        />
      </div>
    </>
  );
};

export default VerseActionsMenu;
