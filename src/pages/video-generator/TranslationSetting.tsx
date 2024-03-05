/* eslint-disable max-lines */
import { useCallback } from 'react';

import { Action } from '@reduxjs/toolkit';
import groupBy from 'lodash/groupBy';
import omit from 'lodash/omit';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';
import styles from './video.module.scss';

import DataFetcher from '@/components/DataFetcher';
import Checkbox from '@/dls/Forms/Checkbox/Checkbox';
import usePersistPreferenceGroup from '@/hooks/auth/usePersistPreferenceGroup';
import {
    selectTranslations
} from '@/redux/slices/QuranReader/translations';
import { makeTranslationsUrl } from '@/utils/apiPaths';
import { getLocaleName } from '@/utils/locale';
import { TranslationsResponse } from 'types/ApiResponses';
import PreferenceGroup from 'types/auth/PreferenceGroup';
import AvailableTranslation from 'types/AvailableTranslation';

const TranslationSelectionBody = ({ selectedTranslation, setSelectedTranslation }) => {
  const {
    actions: { onSettingsChange },
  } = usePersistPreferenceGroup();
  const { t, lang } = useTranslation('common');
  const translationsState = useSelector(selectTranslations);
  const selectedTranslations  = selectedTranslation;

  /**
   * Persist settings in the DB if the user is logged in before dispatching
   * Redux action, otherwise just dispatch it.
   *
   * @param {number[]} value
   * @param {Action} action
   */
  const onTranslationsSettingsChange = useCallback(
    (value: number[], action: Action, undoAction: Action) => {
      onSettingsChange(
        'selectedTranslations',
        value,
        action,
        undoAction,
        PreferenceGroup.TRANSLATIONS,
      );
    },
    [onSettingsChange],
  );

  const onTranslationsChange = useCallback(
    (selectedTranslationId: number) => {
      return (isChecked: boolean) => {
        // when the checkbox is checked
        // add the selectedTranslationId to redux
        // if unchecked, remove it from redux
        const nextTranslations = isChecked
          ? [...selectedTranslations, selectedTranslationId]
          : selectedTranslations.filter((id) => id !== selectedTranslationId); // remove the id

        // logItemSelectionChange('translation', selectedTranslationId.toString(), isChecked);
        // logValueChange('selected_translations', selectedTranslations, nextTranslations);
        // onTranslationsSettingsChange(
        //   nextTranslations,
        //   setSelectedTranslations({ translations: nextTranslations, locale: lang }),
        //   setSelectedTranslations({ translations: selectedTranslations, locale: lang }),
        // );
        setSelectedTranslation(nextTranslations);
      };
    },
    [lang, onTranslationsSettingsChange, selectedTranslations, setSelectedTranslation],
  );

  const renderTranslationGroup = useCallback(
    (language: string, translations: AvailableTranslation[]) => {
      if (!translations) {
        return <></>;
      }
      return (
        <div className={styles.group} key={language}>
          <div className={styles.language}>{language}</div>
          {translations.map((translation: AvailableTranslation) => (
            <div key={translation.id} className={styles.item}>
              <Checkbox
                id={translation.id.toString()}
                checked={selectedTranslations.includes(translation.id)}
                label={translation.translatedName.name}
                onChange={onTranslationsChange(translation.id)}
              />
            </div>
          ))}
        </div>
      );
    },
    [onTranslationsChange, selectedTranslations],
  );

  return (
    <div>
      <DataFetcher
        queryKey={makeTranslationsUrl(lang)}
        render={(data: TranslationsResponse) => {
          const translationByLanguages = groupBy(data.translations, 'languageName');
          const selectedTranslationLanguage = getLocaleName(lang).toLowerCase();
          const selectedTranslationGroup = translationByLanguages[selectedTranslationLanguage];
          const translationByLanguagesWithoutSelectedLanguage = omit(translationByLanguages, [
            selectedTranslationLanguage,
          ]);

          return (
            <div>
              {renderTranslationGroup(selectedTranslationLanguage, selectedTranslationGroup)}
              {Object.entries(translationByLanguagesWithoutSelectedLanguage)
                .sort((a, b) => {
                  return a[0].localeCompare(b[0]);
                })
                .map(([language, translations]) => {
                  return renderTranslationGroup(language, translations);
                })}
            </div>
          );
        }}
      />
    </div>
  );
};

export default TranslationSelectionBody;
