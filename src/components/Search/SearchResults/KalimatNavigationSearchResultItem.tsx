/* eslint-disable react/no-danger */

import React, { useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './SearchResultItem.module.scss';

import DataContext from '@/contexts/DataContext';
import Link from '@/dls/Link/Link';
import SearchService from '@/types/Search/SearchService';
import { SearchNavigationType } from '@/types/SearchNavigationResult';
import SearchQuerySource from '@/types/SearchQuerySource';
import { getChapterData } from '@/utils/chapter';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedVerseKey } from '@/utils/locale';
import { resolveUrlBySearchNavigationType } from '@/utils/navigation';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';

interface Props {
  name: string;
  resultKey: string | number;
  source: SearchQuerySource;
}

const KalimatNavigationSearchResultItem: React.FC<Props> = ({ name, source, resultKey }) => {
  const { t, lang } = useTranslation();
  const chaptersData = useContext(DataContext);
  const [surahNumber] = getVerseAndChapterNumbersFromKey(resultKey as string);
  const onResultItemClicked = () => {
    logButtonClick(`search_result_item`, {
      service: SearchService.KALIMAT,
      source,
    });
  };

  const url = resolveUrlBySearchNavigationType(SearchNavigationType.AYAH, resultKey, true);

  return (
    <>
      <Link className={styles.verseKey} href={url} onClick={onResultItemClicked}>
        {`${t('common:surah')} ${
          getChapterData(chaptersData, `${surahNumber}`).transliteratedName
        } (${toLocalizedVerseKey(resultKey as string, lang)})`}
      </Link>
      <div className={styles.translationContainer}>
        <div dangerouslySetInnerHTML={{ __html: name }} />
      </div>
    </>
  );
};
export default KalimatNavigationSearchResultItem;
