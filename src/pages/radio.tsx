import classNames from 'classnames';
import { GetStaticProps } from 'next';
import useTranslation from 'next-translate/useTranslation';

import pageStyle from './index.module.scss';
import radioStyle from './radio.module.scss';

import { getAvailableReciters } from '@/api';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import CuratedStationList from '@/components/Radio/CuratedStationList';
import ReciterStationList from '@/components/Radio/ReciterStationList';
import { getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl } from '@/utils/navigation';
import Reciter from 'types/Reciter';

type RadioPageProps = {
  reciters: Reciter[];
};

const NAVIGATION_URL = '/radio';

const RadioPage = ({ reciters }: RadioPageProps) => {
  const { t, lang } = useTranslation('radio');

  return (
    <>
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
    </>
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
