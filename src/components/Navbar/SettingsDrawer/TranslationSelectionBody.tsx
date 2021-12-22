import { useState } from 'react';

import Fuse from 'fuse.js';
import groupBy from 'lodash/groupBy';
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

  const onTranslationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

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
          return (
            <div>
              {Object.entries(translationByLanguages).map(([language, translations]) => {
                return (
                  <div className={styles.group} key={language}>
                    <div className={styles.language}>{language}</div>
                    {translations.map((translation) => (
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
              })}
            </div>
          );
        }}
      />
    </div>
  );
};

export default TranslationSelectionBody;
