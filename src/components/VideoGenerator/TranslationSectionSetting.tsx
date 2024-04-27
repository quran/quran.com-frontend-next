import { useCallback, useMemo, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';

import TranslationSettings from './TranslationSetting';
import styles from './video.module.scss';

import DataFetcher from '@/components/DataFetcher';
import Section from '@/components/Navbar/SettingsDrawer/Section';
import Counter from '@/dls/Counter/Counter';
import Modal from '@/dls/Modal/Modal';
import SelectionCard from '@/dls/SelectionCard/SelectionCard';
import Skeleton from '@/dls/Skeleton/Skeleton';
import {
  MAXIMUM_TRANSLATIONS_FONT_STEP,
  MINIMUM_FONT_STEP,
} from '@/redux/slices/QuranReader/styles';
import {
  selectTranslationFontScale,
  selectTranslations,
  updateSettings,
} from '@/redux/slices/videoGenerator';
import { makeTranslationsUrl } from '@/utils/apiPaths';
import { toLocalizedNumber } from '@/utils/locale';
import { TranslationsResponse } from 'types/ApiResponses';

const TranslationSettingsSection = () => {
  const translations = useSelector(selectTranslations, shallowEqual);
  const translationFontScale = useSelector(selectTranslationFontScale, shallowEqual);
  const { t, lang } = useTranslation('common');
  const [showTranslationsList, setShowTranslationsList] = useState(false);
  const dispatch = useDispatch();

  const translationLoading = useCallback(
    () => (
      <div>
        {translations.map((id) => (
          <Skeleton className={styles.skeleton} key={id} />
        ))}
      </div>
    ),
    [translations],
  );

  const localizedSelectedTranslations = useMemo(
    () => toLocalizedNumber(translations.length - 1, lang),
    [translations, lang],
  );

  const onSelectionCardClicked = useCallback(() => {
    setShowTranslationsList(!showTranslationsList);
  }, [setShowTranslationsList, showTranslationsList]);

  const renderTranslations = useCallback(
    (data: TranslationsResponse) => {
      if (!data) {
        return null;
      }
      const firstSelectedTranslation = data.translations.find(
        (translation) => translation.id === translations[0],
      );

      let selectedValueString = t('settings.no-translation-selected');
      if (translations.length === 1) selectedValueString = firstSelectedTranslation?.name;
      if (translations.length === 2) {
        selectedValueString = t('settings.value-and-other', {
          value: firstSelectedTranslation?.name,
          othersCount: localizedSelectedTranslations,
        });
      }
      if (translations.length > 2) {
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
    [localizedSelectedTranslations, onSelectionCardClicked, translations, t],
  );

  const clearTranslations = () => {
    dispatch(updateSettings({ translations: [] }));
  };

  const onFontScaleDecreaseClicked = () => {
    const newValue = translationFontScale - 1;
    dispatch(updateSettings({ translationFontScale: newValue }));
  };

  const onFontScaleIncreaseClicked = () => {
    const newValue = translationFontScale + 1;
    dispatch(updateSettings({ translationFontScale: newValue }));
  };

  return (
    <div>
      <Section>
        <Section.Title>{t('translation')}</Section.Title>
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
      {showTranslationsList ? (
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
                  <TranslationSettings selectedTranslations={translations} />
                </div>
              </Modal.Header>
            </Modal.Body>
            <Modal.Footer>
              <Modal.Action onClick={clearTranslations}>
                {t('video-generator:deselect')}
              </Modal.Action>
              <Modal.CloseAction onClick={onSelectionCardClicked}>{t('close')}</Modal.CloseAction>
            </Modal.Footer>
          </Modal>
        </div>
      ) : null}
    </div>
  );
};
export default TranslationSettingsSection;
