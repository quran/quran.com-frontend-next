import React, { memo } from 'react';

import groupBy from 'lodash/groupBy';

import styles from './Filter.module.scss';
import TranslationGroup from './TranslationGroup';

import AvailableTranslation from 'types/AvailableTranslation';

interface Props {
  onTranslationChange: (translationId: string[]) => void;
  selectedTranslations: string;
  translations: AvailableTranslation[];
}

const TranslationsFilter: React.FC<Props> = memo(
  ({ translations, selectedTranslations, onTranslationChange }) => {
    const translationByLanguages = groupBy(translations, 'languageName');
    return (
      <div className={styles.comboboxItems}>
        {Object.entries(translationByLanguages).map(([language, languageTranslations]) => {
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
