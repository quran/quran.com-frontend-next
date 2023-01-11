import classNames from 'classnames';
import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import pageStyle from './index.module.scss';
import radioStyle from './radio.module.scss';

import NextSeoWrapper from '@/components/NextSeoWrapper';
import CuratedStationList from '@/components/Radio/CuratedStationList';
import ReciterStationList from '@/components/Radio/ReciterStationList';
import { getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl } from '@/utils/navigation';
import { getAvailableReciters } from 'src/api';
import DataContext from 'src/contexts/DataContext';
import ChaptersData from 'types/ChaptersData';
import Reciter from 'types/Reciter';

type RadioPageProps = {
  reciters: Reciter[];
  chaptersData: ChaptersData;
};

const NAVIGATION_URL = '/radio';

const RadioPage = ({ reciters, chaptersData }: RadioPageProps) => {
  const { t } = useTranslation('radio');
  const { locale } = useRouter();

  return (
    <DataContext.Provider value={chaptersData}>
      <NextSeoWrapper
        title={t('common:quran-radio')}
        canonical={getCanonicalUrl(locale, NAVIGATION_URL)}
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
