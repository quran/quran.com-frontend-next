import React, { useState, useEffect } from 'react';

import clipboardCopy from 'clipboard-copy';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useDispatch, shallowEqual, useSelector } from 'react-redux';

import BookmarkedIcon from '../../../public/icons/bookmark.svg';
import ChatIcon from '../../../public/icons/chat.svg';
import CopyIcon from '../../../public/icons/copy.svg';
import LinkIcon from '../../../public/icons/east.svg';
import ShareIcon from '../../../public/icons/share.svg';
import TafsirIcon from '../../../public/icons/tafsir.svg';
import UnBookmarkedIcon from '../../../public/icons/unbookmarked.svg';
import { onShareClicked } from '../QuranReader/TranslationView/ShareVerseButton';

import styles from './OverflowVerseActionsMenyBody.module.scss';
import VerseActionAdvancedCopy from './VerseActionAdvancedCopy';
import VerseActionRepeatAudio from './VerseActionRepeatAudio';

import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import { toast, ToastStatus } from 'src/components/dls/Toast/Toast';
import { selectBookmarks, toggleVerseBookmark } from 'src/redux/slices/QuranReader/bookmarks';
import { getQuranReflectVerseUrl } from 'src/utils/navigation';
import { navigateToExternalUrl } from 'src/utils/url';
import { getVerseUrl } from 'src/utils/verse';
import Verse from 'types/Verse';

interface Props {
  verse: Verse;
}

const RESET_COPY_TEXT_TIMEOUT_MS = 3 * 1000;

const OverflowVerseActionsMenuBody: React.FC<Props> = ({ verse }) => {
  const { t } = useTranslation('common');
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

  const isVerseBookmarked = !!bookmarkedVerses[verse.verseKey];

  const verseUrl = getVerseUrl(verse.verseKey);
  const shouldShowGoToAyah = router.asPath !== verseUrl;
  const dispatch = useDispatch();
  const onToggleBookmarkClicked = () => {
    dispatch({ type: toggleVerseBookmark.type, payload: verse.verseKey });
  };
  return (
    <>
      <PopoverMenu.Item onClick={onCopyClicked} icon={<CopyIcon />}>
        {isCopied ? `${t('copied')}!` : `${t('copy')}`}
      </PopoverMenu.Item>

      <VerseActionAdvancedCopy verse={verse} />

      <PopoverMenu.Item onClick={onTafsirsClicked} icon={<TafsirIcon />}>
        {t('quran-reader:tafsirs')}
      </PopoverMenu.Item>

      <PopoverMenu.Item
        className={styles.hiddenOnDesktop}
        onClick={() => navigateToExternalUrl(getQuranReflectVerseUrl(verse.verseKey))}
        icon={<ChatIcon />}
      >
        {t('reflect')}
      </PopoverMenu.Item>

      <PopoverMenu.Item
        className={styles.hiddenOnDesktop}
        onClick={() =>
          onShareClicked(verse.verseKey, () => {
            setIsShared(true);
            toast(t('shared'), { status: ToastStatus.Success });
          })
        }
        icon={<ShareIcon />}
      >
        {isShared ? `${t('shared')}` : `${t('share')}`}
      </PopoverMenu.Item>

      <PopoverMenu.Item
        onClick={onToggleBookmarkClicked}
        icon={isVerseBookmarked ? <BookmarkedIcon /> : <UnBookmarkedIcon />}
      >
        {isVerseBookmarked ? `${t('bookmarked')}!` : `${t('bookmark')}`}
      </PopoverMenu.Item>

      <VerseActionRepeatAudio verseKey={verse.verseKey} />

      {shouldShowGoToAyah && (
        <PopoverMenu.Item onClick={() => router.push(verseUrl)} icon={<LinkIcon />}>
          {t('quran-reader:go-ayah')}
        </PopoverMenu.Item>
      )}
    </>
  );
};

export default OverflowVerseActionsMenuBody;
