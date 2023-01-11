import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

import ScrollableSelection from './ScrollableSelection';

import { selectedLastReadPage } from '@/redux/slices/QuranReader/readingTracker';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { getPageNavigationUrl } from '@/utils/navigation';
import { getPageIdsByMushaf } from '@/utils/page';

const PageSelection = () => {
  const { t } = useTranslation('common');
  const { locale } = useRouter();
  const { quranFont, mushafLines } = useSelector(selectQuranReaderStyles);
  const pageIds = getPageIdsByMushaf(locale, quranFont, mushafLines);
  const lastReadPage = useSelector(selectedLastReadPage);

  return (
    <ScrollableSelection
      items={pageIds}
      getHref={getPageNavigationUrl}
      searchPlaceholder={t('sidebar.search-page')}
      renderItem={(page) => `${t('page')} ${page.label}`}
      isJuz={false}
      selectedItem={Number(lastReadPage)}
    />
  );
};

export default PageSelection;
