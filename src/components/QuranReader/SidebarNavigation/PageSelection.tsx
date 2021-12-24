import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import ScrollableSelection from './ScrollableSelection';

import { selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import { getPageNavigationUrl } from 'src/utils/navigation';
import { getPageIdsByMushaf } from 'src/utils/page';

const PageSelection = () => {
  const { t, lang } = useTranslation('common');
  const { quranFont, mushafLines } = useSelector(selectQuranReaderStyles);
  const pageIds = getPageIdsByMushaf(lang, quranFont, mushafLines);

  return (
    <ScrollableSelection
      items={pageIds}
      getHref={getPageNavigationUrl}
      searchPlaceholder={t('sidebar.search-page')}
      renderItem={(page) => `${t('page')} ${page.label}`}
      isJuz={false}
    />
  );
};

export default PageSelection;
