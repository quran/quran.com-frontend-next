import classNames from 'classnames';
import { GetStaticProps } from 'next';
import useTranslation from 'next-translate/useTranslation';

import pageStyle from './index.module.scss';
import radioStyle from './radio.module.scss';

import { getAvailableReciters } from 'src/api';
import NextSeoWrapper from 'src/components/NextSeoWrapper';
import CuratedStationList from 'src/components/Radio/CuratedStationList';
import ReciterStationList from 'src/components/Radio/ReciterStationList';
import DataContext from 'src/contexts/DataContext';
import { getAllChaptersData } from 'src/utils/chapter';
import { getLanguageAlternates } from 'src/utils/locale';
import { getCanonicalUrl } from 'src/utils/navigation';
import ChaptersData from 'types/ChaptersData';
import Reciter from 'types/Reciter';

type RadioPageProps = {
  reciters: Reciter[];
  chaptersData: ChaptersData;
};

const NAVIGATION_URL = '/radio';

const RadioPage = ({ reciters, chaptersData }: RadioPageProps) => {
  const { t, lang } = useTranslation('radio');
  return (
    <DataContext.Provider value={chaptersData}>
      <NextSeoWrapper
        title={t('common:quran-radio')}
        canonical={getCanonicalUrl(lang, NAVIGATION_URL)}
        languageAlternates={getLanguageAlternates(NAVIGATION_URL)}
        description={t('radio-desc')}
      />
      <div className={pageStyle.pageContainer}>
        <div className={radioStyle.ribbon} />
        <div className={pageStyle.flow}>
          <div
            className={classNames(pageStyle.flowItem, radioStyle.title, radioStyle.titleOnRibbon)}
          >
            {t('curated-stations')}
          </div>
          <div className={classNames(pageStyle.flowItem, pageStyle.fullWidth)}>
            <CuratedStationList />
          </div>
          <div className={classNames(pageStyle.flowItem, radioStyle.title)}>
            {t('reciter-stations')}
          </div>
          <div className={classNames(pageStyle.flowItem, pageStyle.fullWidth)}>
            <ReciterStationList reciters={reciters} />
          </div>
        </div>
      </div>
    </DataContext.Provider>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  try {
    const chaptersData = await getAllChaptersData(locale);
    const { reciters } = await getAvailableReciters(locale, ['profile_picture']);
    return {
      props: {
        chaptersData,
        reciters,
      },
    };
  } catch (e) {
    return {
      notFound: true,
    };
  }
};

export default RadioPage;
