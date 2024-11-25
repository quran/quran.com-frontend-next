/* eslint-disable max-lines */
import { useCallback, useState } from 'react';

import { Action } from '@reduxjs/toolkit';
import groupBy from 'lodash/groupBy';
import omit from 'lodash/omit';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import styles from './SearchSelectionBody.module.scss';

import DataFetcher from '@/components/DataFetcher';
import Checkbox from '@/dls/Forms/Checkbox/Checkbox';
import Input from '@/dls/Forms/Input';
import SpinnerContainer from '@/dls/Spinner/SpinnerContainer';
import usePersistPreferenceGroup from '@/hooks/auth/usePersistPreferenceGroup';
import useRemoveQueryParam from '@/hooks/useRemoveQueryParam';
import IconSearch from '@/icons/search.svg';
import {
  selectTranslations,
  setSelectedTranslations,
} from '@/redux/slices/QuranReader/translations';
import SearchQuerySource from '@/types/SearchQuerySource';
import { makeTranslationsUrl } from '@/utils/apiPaths';
import { logValueChange, logItemSelectionChange, logEmptySearchResults } from '@/utils/eventLogger';
import filterTranslations, { getTranslations } from '@/utils/filter-translations';
import { getLocaleName } from '@/utils/locale';
import { TranslationsResponse } from 'types/ApiResponses';
import PreferenceGroup from 'types/auth/PreferenceGroup';
import AvailableTranslation from 'types/AvailableTranslation';
import QueryParam from 'types/QueryParam';

const TranslationSelectionBody = () => {
  const {
    actions: { onSettingsChange },
    isLoading,
  } = usePersistPreferenceGroup();
  const { t, lang } = useTranslation('common');
  const router = useRouter();
  const translationsState = useSelector(selectTranslations);
  const { selectedTranslations } = translationsState;
  const [searchQuery, setSearchQuery] = useState('');
  const removeQueryParam = useRemoveQueryParam();

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

        // if unchecked also remove from query param
        if (!isChecked) {
          removeQueryParam(QueryParam.TRANSLATIONS);
        }

        logItemSelectionChange('translation', selectedTranslationId.toString(), isChecked);
        logValueChange('selected_translations', selectedTranslations, nextTranslations);
        onTranslationsSettingsChange(
          nextTranslations,
          setSelectedTranslations({ translations: nextTranslations, locale: lang }),
          setSelectedTranslations({ translations: selectedTranslations, locale: lang }),
        );
        if (nextTranslations.length) {
          router.query[QueryParam.TRANSLATIONS] = nextTranslations.join(',');
          router.push(router, undefined, { shallow: true });
        }
      };
    },
    [lang, onTranslationsSettingsChange, router, selectedTranslations, removeQueryParam],
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
      <div className={styles.searchInputContainer}>
        <SpinnerContainer isLoading={isLoading}>
          <Input
            prefix={<IconSearch />}
            id="translations-search"
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t('settings.search-translations')}
            fixedWidth={false}
            containerClassName={styles.input}
          />
        </SpinnerContainer>
      </div>
      <DataFetcher
        queryKey={makeTranslationsUrl(lang)}
        render={(data: TranslationsResponse) => {
          const filteredTranslations = searchQuery
            ? filterTranslations(data.translations, searchQuery)
            : data.translations;

          if (!filteredTranslations.length) {
            logEmptySearchResults({
              query: searchQuery,
              source: SearchQuerySource.TranslationSettingsDrawer,
            });
          }

          const translationByLanguages = groupBy(
            getTranslations(filteredTranslations),
            'languageName',
          );
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
