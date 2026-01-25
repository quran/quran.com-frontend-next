import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import styles from '../ChapterHeader.module.scss';

import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import ChevronDownIcon from '@/icons/chevron-down.svg';
import { setIsSettingsDrawerOpen, setSettingsView, SettingsView } from '@/redux/slices/navbar';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import { logButtonClick, logEvent } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';

interface TranslationSettingsButtonProps {
  translationName: string;
}

/**
 * A button that opens the translation settings drawer.
 * Used in ChapterHeader and ReaderTopActions to allow users to change translations.
 *
 * @returns {JSX.Element} The translation settings button
 */
const TranslationSettingsButton: React.FC<TranslationSettingsButtonProps> = ({
  translationName,
}) => {
  const dispatch = useDispatch();
  const { t, lang } = useTranslation('quran-reader');
  const selectedTranslations = useSelector(selectSelectedTranslations);
  const translationsCount = selectedTranslations?.length || 0;

  const onChangeTranslationClicked = () => {
    dispatch(setSettingsView(SettingsView.Translation));
    logEvent('drawer_settings_open');
    dispatch(setIsSettingsDrawerOpen(true));
    logButtonClick('translation_settings_button_click');
  };

  return (
    <Button
      variant={ButtonVariant.ModeToggle}
      size={ButtonSize.XSmall}
      shape={ButtonShape.Pill}
      onClick={onChangeTranslationClicked}
      ariaLabel={t('change-translation')}
      className={styles.changeTranslationButton}
      contentClassName={styles.translationName}
      suffix={
        <>
          {translationsCount > 1 && (
            <span className={styles.translationsCount}>
              {`+${toLocalizedNumber(translationsCount - 1, lang)}`}
            </span>
          )}
          <ChevronDownIcon className={styles.dropdownIcon} />
        </>
      }
    >
      <span>
        {t('common:translation')}: {translationName}
      </span>
    </Button>
  );
};

export default TranslationSettingsButton;
