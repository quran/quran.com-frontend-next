import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import KalimatNavigationSearchResultItem from './KalimatNavigationSearchResultItem';
import styles from './SearchResultItem.module.scss';

import Button from '@/dls/Button/Button';
import { SearchNavigationType } from '@/types/Search/SearchNavigationResult';
import SearchService from '@/types/Search/SearchService';
import SearchVerseItem from '@/types/Search/SearchVerseItem';
import SearchQuerySource from '@/types/SearchQuerySource';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedNumber, toLocalizedVerseKey } from '@/utils/locale';
import { resolveUrlBySearchNavigationType } from '@/utils/navigation';

interface Props {
  result: SearchVerseItem;
  source: SearchQuerySource;
  service?: SearchService;
}

const SearchResultItem: React.FC<Props> = ({ result, source, service = SearchService.KALIMAT }) => {
  const { lang } = useTranslation('quran-reader');
  const url = resolveUrlBySearchNavigationType(result.resultType, result.key, true);

  const getKalimatResultSuffix = () => {
    if (result.resultType === SearchNavigationType.SURAH) {
      return `(${toLocalizedNumber(Number(result.key), lang)})`;
    }

    if (result.resultType === SearchNavigationType.AYAH) {
      return `(${toLocalizedVerseKey(result.key as string, lang)})`;
    }

    return undefined;
  };

  const suffix = getKalimatResultSuffix();

  const onResultItemClicked = () => {
    logButtonClick(`search_result_item`, {
      service,
      source,
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.itemContainer}>
        <div className={styles.quranTextResult} translate="no">
          {result.resultType === SearchNavigationType.AYAH ? (
            <KalimatNavigationSearchResultItem
              key={result.key}
              name={result.name}
              resultKey={result.key}
              source={source}
            />
          ) : (
            <Button onClick={onResultItemClicked} href={url} suffix={suffix}>
              {result.name}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
export default SearchResultItem;
