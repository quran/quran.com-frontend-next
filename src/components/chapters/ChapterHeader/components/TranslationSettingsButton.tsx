import React, { useCallback } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import styles from '../ReadingModeActions.module.scss';

import DataFetcher from '@/components/DataFetcher';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import ChevronDownIcon from '@/icons/chevron-down.svg';
import { setIsSettingsDrawerOpen, setSettingsView, SettingsView } from '@/redux/slices/navbar';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import { makeTranslationsUrl } from '@/utils/apiPaths';
import { logButtonClick, logEvent } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import { TranslationsResponse } from 'types/ApiResponses';

/**
 * A button that opens the translation settings drawer.
 * Used in ChapterHeader and ReaderTopActions to allow users to change translations.
 *
 * @returns {JSX.Element} The translation settings button
 */
const TranslationSettingsButton: React.FC = () => {
  const dispatch = useDispatch();
  const { t, lang } = useTranslation('common');
  const selectedTranslations = useSelector(selectSelectedTranslations);
  const translationsCount = selectedTranslations?.length || 0;

  const onChangeTranslationClicked = useCallback(() => {
    dispatch(setSettingsView(SettingsView.Translation));
    logEvent('drawer_settings_open');
    dispatch(setIsSettingsDrawerOpen(true));
    logButtonClick('translation_settings_button_click');
  }, [dispatch]);

  const renderButton = useCallback(
    (data: TranslationsResponse) => {
      // Find the first selected translation to display its name
      const firstSelectedId = selectedTranslations?.[0];
      const activeTranslation = data?.translations?.find((tr) => tr.id === firstSelectedId);
      const displayName =
        activeTranslation?.translatedName?.name || t('reading-preference.none-selected');

      return (
        <Button
          variant={ButtonVariant.ModeToggle}
          size={ButtonSize.XSmall}
          shape={ButtonShape.Pill}
          onClick={onChangeTranslationClicked}
          ariaLabel={t('translation')}
          className={styles.translationButton}
          contentClassName={styles.translationButtonContent}
          suffix={
            <>
              {translationsCount > 1 && (
                <span>{`+${toLocalizedNumber(translationsCount - 1, lang)}`}</span>
              )}
              <ChevronDownIcon className={styles.dropdownIcon} />
            </>
          }
        >
          <span className={styles.translationText}>
            {t('translation')}: {displayName}
          </span>
        </Button>
      );
    },
    [selectedTranslations, translationsCount, lang, t, onChangeTranslationClicked],
  );

  const renderLoading = useCallback(
    () => (
      <Button
        variant={ButtonVariant.ModeToggle}
        size={ButtonSize.XSmall}
        shape={ButtonShape.Pill}
        onClick={onChangeTranslationClicked}
        ariaLabel={t('translation')}
        className={styles.translationButton}
        contentClassName={styles.translationButtonContent}
        suffix={
          <>
            {translationsCount > 1 && (
              <span>{`+${toLocalizedNumber(translationsCount - 1, lang)}`}</span>
            )}
            <ChevronDownIcon className={styles.dropdownIcon} />
          </>
        }
      >
        <span className={styles.translationText}>{t('translation')}</span>
      </Button>
    ),
    [translationsCount, lang, t, onChangeTranslationClicked],
  );

  return (
    <DataFetcher
      queryKey={makeTranslationsUrl(lang)}
      render={renderButton}
      loading={renderLoading}
    />
  );
};

export default TranslationSettingsButton;
