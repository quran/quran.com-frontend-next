/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import React, { useContext, useEffect, useState } from 'react';

import clipboardCopy from 'clipboard-copy';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import copyVerse from '@/components/Verse/AdvancedCopy/utils/copyVerse';
import VerseActionAdvancedCopy from '@/components/Verse/VerseActionAdvancedCopy';
import DataContext from '@/contexts/DataContext';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import ChevronLeftIcon from '@/icons/chevron-left.svg';
import CopyLinkIcon from '@/icons/copy-link.svg';
import CopyIcon from '@/icons/copy.svg';
import VideoIcon from '@/icons/video.svg';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import PreviewMode from '@/types/Media/PreviewMode';
import QueryParam from '@/types/QueryParam';
import { QuranFont } from '@/types/QuranReader';
import Verse from '@/types/Verse';
import { areArraysEqual } from '@/utils/array';
import { logButtonClick } from '@/utils/eventLogger';
import { getQuranMediaMakerNavigationUrl } from '@/utils/navigation';
import { getWindowOrigin } from '@/utils/url';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';

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
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual) as number[];
  const chaptersData = useContext(DataContext);
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

    const showRangeOfVerses = false;
    const rangeEndVerse = null;
    const rangeStartVerse = null;
    const shouldCopyFootnotes = true;
    const shouldIncludeTranslatorName = true;
    const shouldCopyFont = QuranFont.Uthmani;
    const translations = {};

    selectedTranslations.forEach((translationId) => {
      translations[translationId] = {
        shouldBeCopied: true, // the default is to copy the translation
        name: '',
      };
    });

    copyVerse({
      showRangeOfVerses,
      rangeEndVerse,
      rangeStartVerse,
      shouldCopyFootnotes,
      shouldIncludeTranslatorName,
      shouldCopyFont,
      translations,
      verseKey: verse.verseKey,
      lang,
      chaptersData,
    })
      .then(() => {
        setIsCopied(true);
      })
      .catch(() => {
        setIsCopied(false);
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
        [QueryParam.PREVIEW_MODE]: PreviewMode.DISABLED,
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
