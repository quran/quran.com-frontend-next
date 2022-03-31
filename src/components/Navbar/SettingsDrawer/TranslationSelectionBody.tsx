import { useCallback, useState } from 'react';

import Fuse from 'fuse.js';
import groupBy from 'lodash/groupBy';
import omit from 'lodash/omit';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';

import IconSearch from '../../../../public/icons/search.svg';

import styles from './SearchSelectionBody.module.scss';

import DataFetcher from 'src/components/DataFetcher';
import Checkbox from 'src/components/dls/Forms/Checkbox/Checkbox';
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
import QueryParam from 'types/QueryParam';

export const filterTranslations = (
  translations: AvailableTranslation[],
  searchQuery: string,
): AvailableTranslation[] => {
  const fuse = new Fuse(translations, {
    keys: ['name', 'languageName', 'authorName', 'translatedName.name'],
    threshold: 0.3,
  });

  const filteredTranslations = fuse.search(searchQuery).map(({ item }) => item);
  if (!filteredTranslations.length) {
    logEmptySearchResults(searchQuery, 'settings_drawer_translation');
  }
  return filteredTranslations;
};

const TranslationSelectionBody = () => {
  const { t, lang } = useTranslation('common');
  const router = useRouter();
  const dispatch = useDispatch();
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual);
  const [searchQuery, setSearchQuery] = useState('');

  const onTranslationsChange = useCallback(
    (selectedTranslationId: number) => {
      return (isChecked: boolean) => {
        // when the checkbox is checked
        // add the selectedTranslationId to redux
        // if unchecked, remove it from redux
        const nextTranslations = isChecked
          ? [...selectedTranslations, selectedTranslationId]
          : selectedTranslations.filter((id) => id !== selectedTranslationId); // remove the id

        logItemSelectionChange('translation', selectedTranslationId.toString(), isChecked);
        logValueChange('selected_translations', selectedTranslations, nextTranslations);
        dispatch(setSelectedTranslations({ translations: nextTranslations, locale: lang }));
        if (nextTranslations.length) {
          router.query[QueryParam.Translations] = nextTranslations.join(',');
          router.push(router, undefined, { shallow: true });
        }
      };
    },
    [dispatch, lang, router, selectedTranslations],
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
            .sort((a: AvailableTranslation, b: AvailableTranslation) =>
              a.authorName.localeCompare(b.authorName),
            )
            .map((translation: AvailableTranslation) => (
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
