/* eslint-disable max-lines */
import { useCallback, useMemo, useState } from 'react';

import { Action } from '@reduxjs/toolkit';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';

import TranslationSetting from './TranslationSetting';
import styles from './video.module.scss';

import DataFetcher from '@/components/DataFetcher';
import Section from '@/components/Navbar/SettingsDrawer/Section';
import Counter from '@/dls/Counter/Counter';
import Modal from '@/dls/Modal/Modal';
import SelectionCard from '@/dls/SelectionCard/SelectionCard';
import Skeleton from '@/dls/Skeleton/Skeleton';
import usePersistPreferenceGroup from '@/hooks/auth/usePersistPreferenceGroup';
import {
  decreaseTranslationFontScale,
  increaseTranslationFontScale,
  MAXIMUM_TRANSLATIONS_FONT_STEP,
  MINIMUM_FONT_STEP,
  selectQuranReaderStyles,
} from '@/redux/slices/QuranReader/styles';
import { makeTranslationsUrl } from '@/utils/apiPaths';
import { logValueChange } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import { TranslationsResponse } from 'types/ApiResponses';
import PreferenceGroup from 'types/auth/PreferenceGroup';

const TranslationSection = ({ selectedTranslation, setSelectedTranslation }) => {
  const {
    actions: { onSettingsChange },
    isLoading,
  } = usePersistPreferenceGroup();
  const { t, lang } = useTranslation('common');
  const selectedTranslations = selectedTranslation;
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const { translationFontScale } = quranReaderStyles;
  const [showTranlsationsList, setShowTranslationsList] = useState(false);

  const translationLoading = useCallback(
    () => (
      <div>
        {selectedTranslations.map((id) => (
          <Skeleton className={styles.skeleton} key={id} />
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
    setShowTranslationsList(!showTranlsationsList);
  }, [setShowTranslationsList, showTranlsationsList]);

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

  const clearTranslations = () => {
    setSelectedTranslation([]);
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
    <div>
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
      {showTranlsationsList ? (
        <div className={styles.translationModalWrapper}>
          <Modal
            isOpen
            onClickOutside={onSelectionCardClicked}
            onEscapeKeyDown={onSelectionCardClicked}
          >
            <Modal.Body>
              <Modal.Header>
                <Modal.Title>{t('translations')}</Modal.Title>
                <div className={styles.translationListContainer}>
                  <TranslationSetting
                    selectedTranslation={selectedTranslation}
                    setSelectedTranslation={setSelectedTranslation}
                  />
                </div>
              </Modal.Header>
            </Modal.Body>
            <Modal.Footer>
              <Modal.Action onClick={clearTranslations}>{t('video.deselect')}</Modal.Action>
              <Modal.CloseAction onClick={onSelectionCardClicked}>{t('close')}</Modal.CloseAction>
            </Modal.Footer>
          </Modal>
        </div>
      ) : null}
    </div>
  );
};
export default TranslationSection;
