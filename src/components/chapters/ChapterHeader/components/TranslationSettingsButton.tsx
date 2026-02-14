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

  const onChangeTranslationClicked = useCallback(() => {
    dispatch(setSettingsView(SettingsView.Translation));
    logEvent('drawer_settings_open');
    dispatch(setIsSettingsDrawerOpen(true));
    logButtonClick('translation_settings_button_click');
  }, [dispatch]);

  const renderButtonWithName = useCallback(
    (displayName?: string, validCount = 0) => (
      <Button
        variant={ButtonVariant.ModeToggle}
        size={ButtonSize.XSmall}
        shape={ButtonShape.Pill}
        onClick={onChangeTranslationClicked}
        className={styles.translationButton}
        contentClassName={styles.translationButtonContent}
        suffix={
          <>
            {validCount > 1 && <span>{`+${toLocalizedNumber(validCount - 1, lang)}`}</span>}
            <ChevronDownIcon className={styles.dropdownIcon} />
          </>
        }
      >
        <span className={styles.translationText}>
          {t('translation')}
          {displayName && `: ${displayName}`}
        </span>
      </Button>
    ),
    [lang, t, onChangeTranslationClicked],
  );

  const renderButton = useCallback(
    (data: TranslationsResponse) => {
      // Filter to only translations that exist in API response
      const validTranslations =
        data?.translations?.filter((tr) => selectedTranslations?.includes(tr.id)) || [];
      const validCount = validTranslations.length;

      const firstSelectedId = selectedTranslations?.[0];
      const activeTranslation = validTranslations.find((tr) => tr.id === firstSelectedId);
      const displayName =
        activeTranslation?.translatedName?.name ||
        (validCount > 0
          ? validTranslations[0]?.translatedName?.name
          : t('reading-preference.none-selected'));

      return renderButtonWithName(displayName, validCount);
    },
    [selectedTranslations, t, renderButtonWithName],
  );

  const renderLoading = useCallback(() => renderButtonWithName(), [renderButtonWithName]);

  return (
    <DataFetcher
      queryKey={makeTranslationsUrl(lang)}
      render={renderButton}
      loading={renderLoading}
    />
  );
};

export default TranslationSettingsButton;
