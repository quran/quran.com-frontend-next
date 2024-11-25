import { memo, useCallback, useRef, useState } from 'react';

import groupBy from 'lodash/groupBy';
import omit from 'lodash/omit';
import useTranslation from 'next-translate/useTranslation';

import styles from '../MediaMaker.module.scss';

import DataFetcher from '@/components/DataFetcher';
import Button, { ButtonShape, ButtonVariant } from '@/dls/Button/Button';
import Checkbox from '@/dls/Forms/Checkbox/Checkbox';
import Input from '@/dls/Forms/Input';
import IconCancel from '@/icons/cancel.svg';
import IconSearch from '@/icons/search.svg';
import { MediaSettingsProps } from '@/types/Media/MediaSettings';
import { makeTranslationsUrl } from '@/utils/apiPaths';
import filterTranslations, { getTranslations } from '@/utils/filter-translations';
import { getLocaleName } from '@/utils/locale';
import { TranslationsResponse } from 'types/ApiResponses';
import AvailableTranslation from 'types/AvailableTranslation';

const TRANSLATIONS_LIMIT = 3;

interface Props extends MediaSettingsProps {
  selectedTranslations: number[];
}

const TranslationSelectionBody: React.FC<Props> = ({ selectedTranslations, onSettingsUpdate }) => {
  const { t, lang } = useTranslation('common');
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef(null);

  const onTranslationsChange = useCallback(
    (selectedTranslationId: number) => {
      return (isChecked: boolean) => {
        const nextTranslations = isChecked
          ? [...selectedTranslations, selectedTranslationId]
          : selectedTranslations.filter((id) => id !== selectedTranslationId); // remove the id
        onSettingsUpdate({ translations: nextTranslations }, 'translations', nextTranslations);
      };
    },
    [onSettingsUpdate, selectedTranslations],
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
                disabled={
                  !selectedTranslations.includes(translation.id) &&
                  selectedTranslations.length === TRANSLATIONS_LIMIT
                }
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
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([language, translations]) => renderTranslationGroup(language, translations))}
            </div>
          );
        }}
      />
    </div>
  );
};

export default memo(TranslationSelectionBody);
