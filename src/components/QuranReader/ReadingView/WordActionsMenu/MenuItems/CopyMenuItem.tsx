import React, { useContext, useEffect, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import PopoverMenu from '@/components/dls/PopoverMenu/PopoverMenu';
import { ToastStatus, useToast } from '@/components/dls/Toast/Toast';
import copyVerse from '@/components/Verse/AdvancedCopy/utils/copyVerse';
import DataContext from '@/contexts/DataContext';
import CopyIcon from '@/icons/copy.svg';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import Language from '@/types/Language';
import { QuranFont } from '@/types/QuranReader';
import { areArraysEqual } from '@/utils/array';
import { logButtonClick } from '@/utils/eventLogger';
import Verse from 'types/Verse';

interface Props {
  verse: Verse;
  onActionTriggered?: () => void;
}

const RESET_ACTION_TEXT_TIMEOUT_MS = 3 * 1000;

const CopyMenuItem: React.FC<Props> = ({ verse, onActionTriggered }) => {
  const { t, lang } = useTranslation('common');
  const [isCopied, setIsCopied] = useState(false);
  const chaptersData = useContext(DataContext);
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual) as number[];
  const toast = useToast();
  const { verseKey } = verse;

  const getTranslationObjects = () => {
    const translations = {};
    selectedTranslations.forEach((translationId) => {
      translations[translationId] = {
        shouldBeCopied: true,
        name: '',
      };
    });
    return translations;
  };

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    if (isCopied) {
      timeoutId = setTimeout(() => {
        setIsCopied(false);
        onActionTriggered?.();
      }, RESET_ACTION_TEXT_TIMEOUT_MS);
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isCopied, onActionTriggered]);

  const onCopyTextClicked = () => {
    logButtonClick('reading_view_verse_actions_menu_copy');
    performCopy();
  };

  const performCopy = () => {
    copyVerse({
      showRangeOfVerses: false,
      rangeEndVerse: null,
      rangeStartVerse: null,
      shouldCopyFootnotes: false,
      shouldIncludeTranslatorName: true,
      shouldCopyFont: QuranFont.Uthmani,
      translations: getTranslationObjects(),
      verseKey,
      lang: lang as Language,
      chaptersData,
    })
      .then(() => {
        setIsCopied(true);
        toast(t('verse-copied'), { status: ToastStatus.Success });
      })
      .catch(() => {
        setIsCopied(false);
      });
  };

  return (
    <PopoverMenu.Item icon={<CopyIcon />} onClick={onCopyTextClicked}>
      {isCopied ? t('copied') : t('quran-reader:copy-verse')}
    </PopoverMenu.Item>
  );
};

export default CopyMenuItem;
