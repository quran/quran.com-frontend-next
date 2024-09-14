import React, { useState, useEffect } from 'react';

import clipboardCopy from 'clipboard-copy';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useSelector, shallowEqual } from 'react-redux';

import VerseActionAdvancedCopy from '@/components/Verse/VerseActionAdvancedCopy';
import NewLabel from '@/dls/Badge/NewLabel';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import ChevronLeftIcon from '@/icons/chevron-left.svg';
import CopyLinkIcon from '@/icons/copy-link.svg';
import CopyIcon from '@/icons/copy.svg';
import VideoIcon from '@/icons/video.svg';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import QueryParam from '@/types/QueryParam';
import Verse from '@/types/Verse';
import { logButtonClick } from '@/utils/eventLogger';
import { getQuranMediaMakerNavigationUrl } from '@/utils/navigation';
import { getWindowOrigin } from '@/utils/url';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';
import { getWordTextFieldNameByFont } from '@/utils/word';

const RESET_ACTION_TEXT_TIMEOUT_MS = 3 * 1000;

export const copyLink = (
  verseKey: string,
  isTranslationView: boolean,
  callback: () => void,
  locale: string,
) => {
  logButtonClick(
    // eslint-disable-next-line i18next/no-literal-string
    `${isTranslationView ? 'translation_view' : 'reading_view'}_verse_actions_menu_copy_link`,
  );
  const origin = getWindowOrigin(locale);
  const [chapter, verse] = getVerseAndChapterNumbersFromKey(verseKey);
  if (origin) {
    clipboardCopy(`${origin}/${chapter}/${verse}`).then(callback);
  }
};

export enum VerseActionsOverflowMenu {
  Main = 'main',
  Share = 'share',
}

type Props = {
  verse: Verse;
  isTranslationView: boolean;
  onActionTriggered?: () => void;
  setSelectedMenu: (selectedMenu: VerseActionsOverflowMenu) => void;
};

const ShareVerseActionsMenu: React.FC<Props> = ({
  verse,
  isTranslationView,
  onActionTriggered,
  setSelectedMenu,
}) => {
  const { t, lang } = useTranslation('common');
  const [isCopied, setIsCopied] = useState(false);
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    // if the user has just copied the text, we should change the text back to Copy after 3 seconds.
    if (isCopied === true) {
      timeoutId = setTimeout(() => {
        setIsCopied(false);
        if (onActionTriggered) {
          onActionTriggered();
        }
      }, RESET_ACTION_TEXT_TIMEOUT_MS);
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isCopied, onActionTriggered]);

  const onCopyClicked = () => {
    logButtonClick(
      // eslint-disable-next-line i18next/no-literal-string
      `${isTranslationView ? 'translation_view' : 'reading_view'}_verse_actions_menu_copy`,
    );
    const verseText = verse.words
      .map((word) => word[getWordTextFieldNameByFont(quranReaderStyles.quranFont)])
      .join(' ');
    clipboardCopy(verseText).then(() => {
      setIsCopied(true);
    });
  };

  const onCopyLinkClicked = () => {
    copyLink(
      verse.verseKey,
      isTranslationView,
      () => toast(t('shared'), { status: ToastStatus.Success }),
      lang,
    );
    if (onActionTriggered) {
      onActionTriggered();
    }
  };

  const onBackClicked = () => {
    logButtonClick(`back_verse_actions_menu`);
    setSelectedMenu(VerseActionsOverflowMenu.Main);
  };

  const onGenerateClicked = () => {
    logButtonClick(`generate_media_verse_action`);
    router.push(
      getQuranMediaMakerNavigationUrl({
        [QueryParam.SURAH]: verse.chapterId as string,
        [QueryParam.VERSE_FROM]: String(verse.verseNumber),
        [QueryParam.VERSE_TO]: String(verse.verseNumber),
      }),
    );
  };
  return (
    <div>
      <PopoverMenu.Item shouldFlipOnRTL icon={<ChevronLeftIcon />} onClick={onBackClicked}>
        {t('common:share')}
      </PopoverMenu.Item>
      <PopoverMenu.Divider />
      <PopoverMenu.Item onClick={onCopyClicked} icon={<CopyIcon />}>
        {isCopied ? `${t('copied')}!` : `${t('quran-reader:copy-verse')}`}
      </PopoverMenu.Item>
      <PopoverMenu.Item onClick={onCopyLinkClicked} icon={<CopyLinkIcon />}>
        {t('quran-reader:cpy-link')}
      </PopoverMenu.Item>
      <PopoverMenu.Item onClick={onGenerateClicked} icon={<VideoIcon />}>
        {t('quran-reader:generate-media')}
        <NewLabel />
      </PopoverMenu.Item>

      <VerseActionAdvancedCopy
        onActionTriggered={onActionTriggered}
        verse={verse}
        isTranslationView={isTranslationView}
      />
    </div>
  );
};

export default ShareVerseActionsMenu;
