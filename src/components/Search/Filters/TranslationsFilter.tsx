import React, { memo } from 'react';

import styles from './Filter.module.scss';
import TranslationGroup from './TranslationGroup';

import { getTranslationsByLanguages } from '@/utils/search';
import AvailableTranslation from 'types/AvailableTranslation';

interface Props {
  onTranslationChange: (translationId: string[]) => void;
  selectedTranslations: string;
  translations: AvailableTranslation[];
}

const TranslationsFilter: React.FC<Props> = memo(
  ({ translations, selectedTranslations, onTranslationChange }) => {
    const translationsByLanguages = getTranslationsByLanguages(translations);
    return (
      <div className={styles.comboboxItems}>
        {Object.entries(translationsByLanguages).map(([language, languageTranslations]) => {
          return (
            <TranslationGroup
              language={language}
              key={language}
              translations={languageTranslations}
              onTranslationsChange={(nextTranslations) => onTranslationChange(nextTranslations)}
              selectedTranslations={selectedTranslations.split(',')}
            />
          );
        })}
      </div>
    );
  },
);

export default TranslationsFilter;
