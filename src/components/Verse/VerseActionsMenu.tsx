import { useState, useEffect } from 'react';
import clipboardCopy from 'clipboard-copy';
import { useRouter } from 'next/router';
import { getWindowOrigin } from 'src/utils/url';
import { useDispatch, useSelector } from 'react-redux';
import {
  Bookmarks,
  selectBookmarks,
  toggleVerseBookmark,
} from 'src/redux/slices/QuranReader/bookmarks';
import VerseActionsMenuItem from './VerseActionsMenuItem';
import CopyIcon from '../../../public/icons/copy.svg';
import TafsirIcon from '../../../public/icons/tafsir.svg';
import ShareIcon from '../../../public/icons/share.svg';
import BookmarkedIcon from '../../../public/icons/bookmark.svg';
import UnBookmarkedIcon from '../../../public/icons/unbookmarked.svg';
import AdvancedCopyIcon from '../../../public/icons/advanced_copy.svg';
import styles from './VerseActionsMenu.module.scss';
import Modal from '../dls/ModalNew/Modal';
import VerseAdvancedCopy from './AdvancedCopy/VerseAdvancedCopy';

interface ActionsVerse {
  textUthmani?: string;
  verseKey?: string;
  chapterId?: number | string;
  verseNumber?: number;
}

interface Props {
  actionsVerse: ActionsVerse;
}

const RESET_COPY_TEXT_TIMEOUT_MS = 3 * 1000;

const VerseActionsMenu: React.FC<Props> = ({ actionsVerse }) => {
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
    clipboardCopy(actionsVerse.textUthmani).then(() => {
      setIsCopied(true);
    });
  };

  const onTafsirsClicked = () => {
    router.push({
      pathname: '/[chapterId]/[verseId]/tafsirs',
      query: { chapterId: actionsVerse.chapterId, verseId: actionsVerse.verseNumber },
    });
  };

  const onShareClicked = () => {
    const origin = getWindowOrigin();
    if (origin) {
      clipboardCopy(`${origin}/${actionsVerse.chapterId}/${actionsVerse.verseNumber}`).then(() => {
        setIsShared(true);
      });
    }
  };

  const onToggleBookmarkClicked = () => {
    dispatch({ type: toggleVerseBookmark.type, payload: actionsVerse.verseKey });
  };

  const isVerseBookmarked = !!bookmarkedVerses[actionsVerse.verseKey];
  return (
    <div className={styles.container}>
      <VerseActionsMenuItem
        title={isCopied ? 'Copied!' : 'Copy'}
        icon={<CopyIcon />}
        onClick={onCopyClicked}
      />

      <Modal
        triggerClassName={styles.container}
        trigger={<VerseActionsMenuItem title="Advanced Copy" icon={<AdvancedCopyIcon />} />}
      >
        <VerseAdvancedCopy verseKey={actionsVerse.verseKey}>
          {({ ayahSelectionComponent, actionText, onCopy }) => (
            <>
              <Modal.Body>
                <Modal.Header>
                  <Modal.Title>Advanced Copy</Modal.Title>
                </Modal.Header>
                {ayahSelectionComponent}
              </Modal.Body>
              <Modal.Footer>
                <Modal.Action onClick={onCopy}>{actionText}</Modal.Action>
              </Modal.Footer>
            </>
          )}
        </VerseAdvancedCopy>
      </Modal>

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
  );
};

export default VerseActionsMenu;
