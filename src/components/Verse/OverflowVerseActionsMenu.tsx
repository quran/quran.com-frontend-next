import React, { useState, useEffect } from 'react';

import clipboardCopy from 'clipboard-copy';
import { useRouter } from 'next/router';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import BookmarkedIcon from '../../../public/icons/bookmark.svg';
import CopyIcon from '../../../public/icons/copy.svg';
import LinkIcon from '../../../public/icons/east.svg';
import OverflowMenuIcon from '../../../public/icons/menu_more_horiz.svg';
import ShareIcon from '../../../public/icons/share.svg';
import TafsirIcon from '../../../public/icons/tafsir.svg';
import UnBookmarkedIcon from '../../../public/icons/unbookmarked.svg';
import PopoverMenu from '../dls/PopoverMenu/PopoverMenu';

import VerseActionAdvancedCopy from './VerseActionAdvancedCopy';
import VerseActionRepeatAudio from './VerseActionRepeatAudio';

import Button, { ButtonType } from 'src/components/dls/Button/Button';
import { selectBookmarks, toggleVerseBookmark } from 'src/redux/slices/QuranReader/bookmarks';
import { getWindowOrigin } from 'src/utils/url';
import { getVerseUrl } from 'src/utils/verse';
import Verse from 'types/Verse';

interface Props {
  verse: Verse;
}

const RESET_COPY_TEXT_TIMEOUT_MS = 3 * 1000;

const OverflowVerseActionsMenu: React.FC<Props> = ({ verse }) => {
  const dispatch = useDispatch();
  const bookmarkedVerses = useSelector(selectBookmarks, shallowEqual);
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

  const verseUrl = getVerseUrl(verse.verseKey);
  const shouldShowGoToAyah = router.asPath !== verseUrl;

  return (
    <PopoverMenu
      trigger={
        <Button tooltip="More" type={ButtonType.Secondary}>
          <OverflowMenuIcon />
        </Button>
      }
    >
      <PopoverMenu.Item onClick={onCopyClicked} icon={<CopyIcon />}>
        {isCopied ? 'Copied!' : 'Copy'}
      </PopoverMenu.Item>

      <VerseActionAdvancedCopy verse={verse} />

      <PopoverMenu.Item onClick={onTafsirsClicked} icon={<TafsirIcon />}>
        Tafsirs
      </PopoverMenu.Item>

      <PopoverMenu.Item onClick={onShareClicked} icon={<ShareIcon />}>
        {isShared ? 'Link has been copied to the clipboard!' : 'Share'}
      </PopoverMenu.Item>

      <PopoverMenu.Item
        onClick={onToggleBookmarkClicked}
        icon={isVerseBookmarked ? <BookmarkedIcon /> : <UnBookmarkedIcon />}
      >
        {isVerseBookmarked ? 'Bookmarked!' : 'Bookmark'}
      </PopoverMenu.Item>

      <VerseActionRepeatAudio verseKey={verse.verseKey} />

      {shouldShowGoToAyah && (
        <PopoverMenu.Item onClick={() => router.push(verseUrl)} icon={<LinkIcon />}>
          Go to Ayah
        </PopoverMenu.Item>
      )}
    </PopoverMenu>
  );
};

export default OverflowVerseActionsMenu;
