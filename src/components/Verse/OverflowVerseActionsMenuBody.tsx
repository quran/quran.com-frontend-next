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
import UnBookmarkedIcon from '../../../public/icons/unbookmarked.svg';
import TafsirVerseAction from '../QuranReader/TafsirView/TafsirVerseAction';
import { onShareClicked } from '../QuranReader/TranslationView/ShareVerseButton';

import styles from './OverflowVerseActionsMenyBody.module.scss';
import VerseActionAdvancedCopy from './VerseActionAdvancedCopy';
import VerseActionRepeatAudio from './VerseActionRepeatAudio';

import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import { ToastStatus, useToast } from 'src/components/dls/Toast/Toast';
import useBrowserLayoutEffect from 'src/hooks/useBrowserLayoutEffect';
import { selectBookmarks, toggleVerseBookmark } from 'src/redux/slices/QuranReader/bookmarks';
import { logButtonClick } from 'src/utils/eventLogger';
import { getQuranReflectVerseUrl } from 'src/utils/navigation';
import { navigateToExternalUrl } from 'src/utils/url';
import { getVerseUrl } from 'src/utils/verse';
import Verse from 'types/Verse';

interface Props {
  verse: Verse;
  isPortalled?: boolean;
}

const RESET_COPY_TEXT_TIMEOUT_MS = 3 * 1000;
const DATA_POPOVER_PORTALLED = 'data-popover-portalled';

const OverflowVerseActionsMenuBody: React.FC<Props> = ({ verse, isPortalled }) => {
  const { t } = useTranslation('common');
  const bookmarkedVerses = useSelector(selectBookmarks, shallowEqual);
  const [isCopied, setIsCopied] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const router = useRouter();
  const toast = useToast();

  /**
   * A hook that will run once to check if the body is portalled or not and if it is,
   * will override the zIndex value manually to 1 so that it doesn't stack on top of
   * the advanced copy/tafsirs modals since the default behavior of Radix is to set
   * a really high value of the zIndex of the container of the portalled component which
   * cause it to be on always on top of our custom Modal.
   */
  useBrowserLayoutEffect(() => {
    // eslint-disable-next-line i18next/no-literal-string
    const portalledElement = window.document.querySelector(`[${DATA_POPOVER_PORTALLED}="true"]`);
    if (portalledElement) {
      // we need to react a few elements up the tree to get to the container that we want to override its zIndex
      const radixPortalElement = portalledElement.closest('[data-radix-portal]') as HTMLElement;
      if (radixPortalElement) {
        radixPortalElement.style.zIndex = '1';
      }
    }
  }, [isPortalled]);

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
    logButtonClick('verse_actions_menu_copy');
    clipboardCopy(verse.textUthmani).then(() => {
      setIsCopied(true);
    });
  };

  const isVerseBookmarked = !!bookmarkedVerses[verse.verseKey];

  const verseUrl = getVerseUrl(verse.verseKey);
  const shouldShowGoToAyah = router.asPath !== verseUrl;
  const dispatch = useDispatch();
  const onToggleBookmarkClicked = () => {
    // eslint-disable-next-line i18next/no-literal-string
    logButtonClick(`verse_actions_menu_${isVerseBookmarked ? 'un_bookmark' : 'bookmark'}`);
    dispatch({ type: toggleVerseBookmark.type, payload: verse.verseKey });
  };

  const onGoToAyahClicked = () => {
    logButtonClick('verse_actions_menu_go_to_verse');
    router.push(verseUrl);
  };

  return (
    <div
      {...{
        [DATA_POPOVER_PORTALLED]: isPortalled,
      }}
    >
      <PopoverMenu.Item onClick={onCopyClicked} icon={<CopyIcon />}>
        {isCopied ? `${t('copied')}!` : `${t('copy')}`}
      </PopoverMenu.Item>

      <VerseActionAdvancedCopy verse={verse} />

      <TafsirVerseAction chapterId={Number(verse.chapterId)} verseNumber={verse.verseNumber} />

      <PopoverMenu.Item
        className={styles.hiddenOnDesktop}
        onClick={() => {
          logButtonClick('verse_actions_menu_reflect');
          navigateToExternalUrl(getQuranReflectVerseUrl(verse.verseKey));
        }}
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
        {t('share')}
      </PopoverMenu.Item>

      <PopoverMenu.Item
        onClick={onToggleBookmarkClicked}
        icon={isVerseBookmarked ? <BookmarkedIcon /> : <UnBookmarkedIcon />}
      >
        {isVerseBookmarked ? `${t('bookmarked')}!` : `${t('bookmark')}`}
      </PopoverMenu.Item>

      <VerseActionRepeatAudio verseKey={verse.verseKey} />

      {shouldShowGoToAyah && (
        <PopoverMenu.Item onClick={onGoToAyahClicked} icon={<LinkIcon />}>
          {t('quran-reader:go-ayah')}
        </PopoverMenu.Item>
      )}
    </div>
  );
};

export default OverflowVerseActionsMenuBody;
