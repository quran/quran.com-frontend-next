/* eslint-disable max-lines */
import { useCallback } from 'react';

import groupBy from 'lodash/groupBy';
import omit from 'lodash/omit';
import useTranslation from 'next-translate/useTranslation';

import styles from './video.module.scss';

import DataFetcher from '@/components/DataFetcher';
import Checkbox from '@/dls/Forms/Checkbox/Checkbox';
import { makeTranslationsUrl } from '@/utils/apiPaths';
import { getLocaleName } from '@/utils/locale';
import { TranslationsResponse } from 'types/ApiResponses';
import AvailableTranslation from 'types/AvailableTranslation';

const TranslationSelectionBody = ({ selectedTranslation, setSelectedTranslation }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { t, lang } = useTranslation('common');
  const selectedTranslations = selectedTranslation;

  const onTranslationsChange = useCallback(
    (selectedTranslationId: number) => {
      return (isChecked: boolean) => {
        const nextTranslations = isChecked
          ? [...selectedTranslations, selectedTranslationId]
          : selectedTranslations.filter((id) => id !== selectedTranslationId); // remove the id
        setSelectedTranslation(nextTranslations);
      };
    },
    [selectedTranslations, setSelectedTranslation],
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
