import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import pageStyle from './index.module.scss';
import radioStyle from './radio.module.scss';

import Footer from 'src/components/dls/Footer/Footer';
import NextSeoWrapper from 'src/components/NextSeoWrapper';
import CuratedStationList from 'src/components/Radio/CuratedStationList';
import ReciterStationList from 'src/components/Radio/ReciterStationList';
import { getLanguageAlternates } from 'src/utils/locale';
import { getCanonicalUrl } from 'src/utils/navigation';

const Radio = () => {
  const { t, lang } = useTranslation('');
  return (
    <div className={pageStyle.pageContainer}>
      <NextSeoWrapper
        title={t('common:quran-radio')}
        url={getCanonicalUrl(lang, '')}
        languageAlternates={getLanguageAlternates('')}
      />
      <div className={radioStyle.ribbon} />
      <div className={pageStyle.flow}>
        <div className={classNames(pageStyle.flowItem, radioStyle.title, radioStyle.titleOnRibbon)}>
          {t('radio:curated-stations')}
        </div>
        <div className={classNames(pageStyle.flowItem, pageStyle.fullWidth)}>
          <CuratedStationList />
        </div>
        <div className={classNames(pageStyle.flowItem, radioStyle.title)}>
          {t('radio:reciter-stations')}
        </div>
        <div className={classNames(pageStyle.flowItem, pageStyle.fullWidth)}>
          <ReciterStationList />
        </div>
      </div>

      <div className={classNames(pageStyle.flowItem, radioStyle.footerContainer)}>
        <Footer />
      </div>
    </div>
  );
};

export default Radio;
