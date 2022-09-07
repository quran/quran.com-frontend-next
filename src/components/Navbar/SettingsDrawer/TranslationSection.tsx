import { useCallback, useMemo } from 'react';

import { Action } from '@reduxjs/toolkit';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import Section from './Section';
import styles from './TranslationSection.module.scss';

import DataFetcher from '@/components/DataFetcher';
import Counter from '@/dls/Counter/Counter';
import SelectionCard from '@/dls/SelectionCard/SelectionCard';
import Skeleton from '@/dls/Skeleton/Skeleton';
import usePersistPreferenceGroup from '@/hooks/auth/usePersistPreferenceGroup';
import { setSettingsView, SettingsView } from '@/redux/slices/navbar';
import {
  decreaseTranslationFontScale,
  increaseTranslationFontScale,
  MAXIMUM_TRANSLATIONS_FONT_STEP,
  MINIMUM_FONT_STEP,
  selectQuranReaderStyles,
} from '@/redux/slices/QuranReader/styles';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import { makeTranslationsUrl } from '@/utils/apiPaths';
import { areArraysEqual } from '@/utils/array';
import { logValueChange } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import { TranslationsResponse } from 'types/ApiResponses';
import PreferenceGroup from 'types/auth/PreferenceGroup';

const TranslationSection = () => {
  const {
    actions: { onSettingsChange },
    isLoading,
  } = usePersistPreferenceGroup();
  const { t, lang } = useTranslation('common');
  const dispatch = useDispatch();
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual);
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const { translationFontScale } = quranReaderStyles;

  const translationLoading = useCallback(
    () => (
      <div>
        {selectedTranslations.map((id) => (
          <Skeleton key={id}>
            <div>{id}</div>
          </Skeleton>
        ))}
      </div>
    ),
    [selectedTranslations],
  );

  const localizedSelectedTranslations = useMemo(
    () => toLocalizedNumber(selectedTranslations.length - 1, lang),
    [selectedTranslations, lang],
  );

  const onSelectionCardClicked = useCallback(() => {
    dispatch(setSettingsView(SettingsView.Translation));
    logValueChange('settings_view', SettingsView.Translation, SettingsView.Body);
  }, [dispatch]);

  const renderTranslations = useCallback(
    (data: TranslationsResponse) => {
      const firstSelectedTranslation = data.translations.find(
        (translation) => translation.id === selectedTranslations[0],
      );

      let selectedValueString = t('settings.no-translation-selected');
      if (selectedTranslations.length === 1) selectedValueString = firstSelectedTranslation?.name;
      if (selectedTranslations.length === 2) {
        selectedValueString = t('settings.value-and-other', {
          value: firstSelectedTranslation?.name,
          othersCount: localizedSelectedTranslations,
        });
      }
      if (selectedTranslations.length > 2) {
        selectedValueString = t('settings.value-and-others', {
          value: firstSelectedTranslation?.name,
          othersCount: localizedSelectedTranslations,
        });
      }

      return (
        <SelectionCard
          label={t('settings.selected-translations')}
          value={selectedValueString}
          onClick={onSelectionCardClicked}
        />
      );
    },
    [localizedSelectedTranslations, onSelectionCardClicked, selectedTranslations, t],
  );

  /**
   * Persist settings in the DB if the user is logged in before dispatching
   * Redux action, otherwise just dispatch it.
   *
   * @param {string} key
   * @param {number} value
   * @param {Action} action
   */
  const onTranslationSettingsChange = (
    key: string,
    value: number,
    action: Action,
    undoAction: Action,
  ) => {
    onSettingsChange(key, value, action, undoAction, PreferenceGroup.QURAN_READER_STYLES);
  };

  const onFontScaleDecreaseClicked = () => {
    const newValue = translationFontScale - 1;
    logValueChange('translation_font_scale', translationFontScale, newValue);
    onTranslationSettingsChange(
      'translationFontScale',
      newValue,
      decreaseTranslationFontScale(),
      increaseTranslationFontScale(),
    );
  };

  const onFontScaleIncreaseClicked = () => {
    const newValue = translationFontScale + 1;
    logValueChange('translation_font_scale', translationFontScale, newValue);
    onTranslationSettingsChange(
      'translationFontScale',
      newValue,
      increaseTranslationFontScale(),
      decreaseTranslationFontScale(),
    );
  };

  return (
    <div className={styles.container}>
      <Section>
        <Section.Title isLoading={isLoading}>{t('translation')}</Section.Title>
        <Section.Row>
          <DataFetcher
            loading={translationLoading}
            queryKey={makeTranslationsUrl(lang)}
            render={renderTranslations}
          />
        </Section.Row>
        <Section.Row>
          <Section.Label>{t('fonts.font-size')}</Section.Label>

          {/* disable `onIncrement` function and UI, when translationFontScale is MAXIMUM_FONT_SCALE
            we do this by giving null to `onIncrement` prop
            same applies to `onDecrement` */}
          <Counter
            count={translationFontScale}
            onIncrement={
              MAXIMUM_TRANSLATIONS_FONT_STEP === translationFontScale
                ? null
                : onFontScaleIncreaseClicked
            }
            onDecrement={
              MINIMUM_FONT_STEP === translationFontScale ? null : onFontScaleDecreaseClicked
            }
          />
        </Section.Row>
      </Section>
    </div>
  );
};
export default TranslationSection;
