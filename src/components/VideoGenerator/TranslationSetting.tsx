import { useCallback, useState, useRef } from 'react';

import groupBy from 'lodash/groupBy';
import omit from 'lodash/omit';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import styles from './video.module.scss';

import DataFetcher from '@/components/DataFetcher';
import Button, { ButtonShape, ButtonVariant } from '@/dls/Button/Button';
import Checkbox from '@/dls/Forms/Checkbox/Checkbox';
import Input from '@/dls/Forms/Input';
import IconCancel from '@/icons/cancel.svg';
import IconSearch from '@/icons/search.svg';
import { updateSettings } from '@/redux/slices/videoGenerator';
import { makeTranslationsUrl } from '@/utils/apiPaths';
import filterTranslations from '@/utils/filter-translations';
import { getLocaleName } from '@/utils/locale';
import { TranslationsResponse } from 'types/ApiResponses';
import AvailableTranslation from 'types/AvailableTranslation';

type Props = {
  selectedTranslations: number[];
};

const TranslationSelectionBody: React.FC<Props> = ({ selectedTranslations }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { t, lang } = useTranslation('common');
  const [searchQuery, setSearchQuery] = useState('');
  const dispatch = useDispatch();
  const inputRef = useRef(null);

  const onTranslationsChange = useCallback(
    (selectedTranslationId: number) => {
      return (isChecked: boolean) => {
        const nextTranslations = isChecked
          ? [...selectedTranslations, selectedTranslationId]
          : selectedTranslations.filter((id) => id !== selectedTranslationId); // remove the id
        dispatch(updateSettings({ translations: nextTranslations }));
      };
    },
    [dispatch, selectedTranslations],
  );

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    inputRef.current.focus();
  }, []);

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
        <Input
          prefix={<IconSearch />}
          id="translations-search"
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t('settings.search-translations')}
          fixedWidth={false}
          containerClassName={styles.input}
          inputRef={inputRef}
        />
        {searchQuery !== '' ? (
          <Button
            className={styles.translationClearSearchButton}
            tooltip={t('search')}
            variant={ButtonVariant.Compact}
            shape={ButtonShape.Circle}
            onClick={clearSearch}
          >
            <IconCancel />
          </Button>
        ) : null}
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
