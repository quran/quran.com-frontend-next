import React from 'react';

import styles from './CommandPrefix.module.scss';

import SearchResultText, {
  SearchResultTextClasses,
} from '@/components/Search/SearchResults/SearchResultItem/SearchResultText';
import SearchResultItemIcon from '@/components/Search/SearchResults/SearchResultItemIcon';
import { getResultType } from '@/utils/search';
import ChaptersData from 'types/ChaptersData';
import { SearchNavigationResult } from 'types/Search/SearchNavigationResult';

interface Props {
  result: SearchNavigationResult;
  arabicChaptersData?: ChaptersData;
}

const textClasses: SearchResultTextClasses = {
  textWrapper: styles.textWrapper,
  columns: styles.columns,
  translationColumn: styles.translationColumn,
  arabicColumn: styles.arabicColumn,
  resultText: styles.resultText,
  translationText: styles.translationText,
  arabic: styles.arabic,
  languageText: styles.languageText,
  metaRow: styles.metaRow,
  metaItem: styles.metaItem,
  metaItemArabic: styles.metaItemArabic,
};

const CommandPrefix: React.FC<Props> = ({ result, arabicChaptersData }) => {
  const type = getResultType(result);

  return (
    <div className={styles.container}>
      <span className={styles.commandPrefix}>
        <SearchResultItemIcon type={type} />
      </span>
      <SearchResultText
        result={result}
        arabicChaptersData={arabicChaptersData}
        classes={textClasses}
        shouldTransform={false}
        textTag="p"
      />
    </div>
  );
};

export default CommandPrefix;
