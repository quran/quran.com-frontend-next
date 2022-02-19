import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import ScrollableSelection from './ScrollableSelection';

import { selectedLastReadPage } from 'src/redux/slices/QuranReader/readingTracker';
import { selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import { getPageNavigationUrl } from 'src/utils/navigation';
import { getPageIdsByMushaf } from 'src/utils/page';

const PageSelection = () => {
  const { t, lang } = useTranslation('common');
  const { quranFont, mushafLines } = useSelector(selectQuranReaderStyles);
  const pageIds = getPageIdsByMushaf(lang, quranFont, mushafLines);
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
