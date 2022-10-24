import { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import ScrollableSelection from './ScrollableSelection';

import { selectLastReadVerseKey } from '@/redux/slices/QuranReader/readingTracker';
import { getJuzIds, getJuzNumberByHizb } from '@/utils/juz';
import { getJuzNavigationUrl } from '@/utils/navigation';

const JuzSelection = () => {
  const { t, lang } = useTranslation('common');
  const juzIds = getJuzIds(lang);
  const lastReadVerseKey = useSelector(selectLastReadVerseKey);
  const selectedJuz = useMemo(
    () => getJuzNumberByHizb(Number(lastReadVerseKey.hizb)),
    [lastReadVerseKey.hizb],
  );

  return (
    <ScrollableSelection
      items={juzIds}
      getHref={getJuzNavigationUrl}
      searchPlaceholder={t('sidebar.search-juz')}
      renderItem={(juz) => `${t('juz')} ${juz.label}`}
      selectedItem={selectedJuz}
    />
  );
};
export default JuzSelection;
