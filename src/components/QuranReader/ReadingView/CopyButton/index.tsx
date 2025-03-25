import React, { useContext, useEffect, useState } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import styles from '@/components/QuranReader/TranslationView/TranslationViewCell.module.scss';
import copyVerse from '@/components/Verse/AdvancedCopy/utils/copyVerse';
import DataContext from '@/contexts/DataContext';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import CopyIcon from '@/icons/copy.svg';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import Language from '@/types/Language';
import { QuranFont } from '@/types/QuranReader';
import { areArraysEqual } from '@/utils/array';
import { logButtonClick } from '@/utils/eventLogger';

type Props = {
  verseKey: string;
  onActionTriggered?: () => void;
  isTranslationView?: boolean;
};

const RESET_ACTION_TEXT_TIMEOUT_MS = 3 * 1000;

const CopyButton: React.FC<Props> = ({
  verseKey,
  onActionTriggered,
  isTranslationView = false,
}) => {
  const { t, lang } = useTranslation('common');
  const [isCopied, setIsCopied] = useState(false);
  const chaptersData = useContext(DataContext);
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual) as number[];
  const toast = useToast();

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
        if (onActionTriggered) {
          onActionTriggered();
        }
      }, RESET_ACTION_TEXT_TIMEOUT_MS);
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isCopied, onActionTriggered]);

  const onCopyTextClicked = () => {
    logButtonClick(
      `${isTranslationView ? 'translation_view' : 'reading_view'}_verse_actions_menu_copy`,
    );
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
    <Button
      onClick={onCopyTextClicked}
      variant={ButtonVariant.Ghost}
      size={ButtonSize.Small}
      tooltip={isCopied ? t('copied') : t('quran-reader:copy-verse')}
      shouldFlipOnRTL={false}
      shape={ButtonShape.Circle}
      className={classNames(styles.iconContainer, styles.verseAction, {
        [styles.fadedVerseAction]: isTranslationView,
      })}
    >
      <span className={styles.icon}>
        <CopyIcon />
      </span>
    </Button>
  );
};

export default CopyButton;
