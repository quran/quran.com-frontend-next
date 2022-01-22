import { useCallback, useState } from 'react';

import Fuse from 'fuse.js';
import groupBy from 'lodash/groupBy';
import omit from 'lodash/omit';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import IconSearch from '../../../../public/icons/search.svg';

import styles from './SearchSelectionBody.module.scss';

import DataFetcher from 'src/components/DataFetcher';
import Input from 'src/components/dls/Forms/Input';
import {
  selectSelectedTranslations,
  setSelectedTranslations,
} from 'src/redux/slices/QuranReader/translations';
import { makeTranslationsUrl } from 'src/utils/apiPaths';
import { areArraysEqual } from 'src/utils/array';
import {
  logEmptySearchResults,
  logValueChange,
  logItemSelectionChange,
} from 'src/utils/eventLogger';
import { getLocaleName } from 'src/utils/locale';
import { TranslationsResponse } from 'types/ApiResponses';
import AvailableTranslation from 'types/AvailableTranslation';

const filterTranslations = (translations, searchQuery: string): AvailableTranslation[] => {
  const fuse = new Fuse(translations, {
    keys: ['name', 'languageName', 'authorName'],
    threshold: 0.3,
  });

  const filteredTranslations = fuse.search(searchQuery).map(({ item }) => item);
  if (!filteredTranslations.length) {
    logEmptySearchResults(searchQuery, 'settings_drawer_translation');
  }
  return filteredTranslations;
};

const TranslationSelectionBody = () => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual);
  const { lang } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const onTranslationsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedTranslationId = e.target.value;
      const isChecked = e.target.checked;

      // when the checkbox is checked
      // add the selectedTranslationId to redux
      // if unchecked, remove it from redux
      const nextTranslations = isChecked
        ? [...selectedTranslations, Number(selectedTranslationId)]
        : selectedTranslations.filter((id) => id !== Number(selectedTranslationId)); // remove the id

      logItemSelectionChange('translation', selectedTranslationId, isChecked);
      logValueChange('selected_translations', selectedTranslations, nextTranslations);
      dispatch(setSelectedTranslations({ translations: nextTranslations, locale: lang }));
    },
    [dispatch, lang, selectedTranslations],
  );

  const renderTranslationGroup = useCallback(
    (language, translations) => {
      if (!translations) {
        return <></>;
      }
      return (
        <div className={styles.group} key={language}>
          <div className={styles.language}>{language}</div>
          {translations
            .sort((a, b) => a.authorName.localeCompare(b.authorName))
            .map((translation) => (
              <div key={translation.id} className={styles.item}>
                <input
                  id={translation.id.toString()}
                  type="checkbox"
                  value={translation.id}
                  checked={selectedTranslations.includes(translation.id)}
                  onChange={onTranslationsChange}
                />
                <label htmlFor={translation.id.toString()}>{translation.authorName}</label>
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
        <Input
          prefix={<IconSearch />}
          id="translations-search"
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t('settings.search-translations')}
          fixedWidth={false}
        />
      </div>
      <DataFetcher
        queryKey={makeTranslationsUrl(lang)}
        render={(data: TranslationsResponse) => {
          const filteredTranslations = searchQuery
            ? filterTranslations(data.translations, searchQuery)
            : data.translations;

          const translationByLanguages = groupBy(filteredTranslations, 'languageName');

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
