import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import pageStyle from './index.module.scss';
import radioStyle from './radio.module.scss';

import Footer from 'src/components/dls/Footer/Footer';
import RandomPlaylist from 'src/components/Radio/CuratedStationList';
import ReciterList from 'src/components/Radio/ReciterStationList';

const Radio = () => {
  const { t } = useTranslation('common');
  return (
    <div className={pageStyle.pageContainer}>
      <div className={pageStyle.flow}>
        <div className={classNames(pageStyle.flowItem, radioStyle.title)}>{t('listen-now')}</div>
        <div className={classNames(pageStyle.flowItem, pageStyle.fullWidth)}>
          <RandomPlaylist />
        </div>
        <div className={classNames(pageStyle.flowItem, radioStyle.title)}>{t('all-reciters')}</div>
        <div className={classNames(pageStyle.flowItem, pageStyle.fullWidth)}>
          <ReciterList />
        </div>
      </div>

      <div className={classNames(pageStyle.flowItem, radioStyle.footerContainer)}>
        <Footer />
      </div>
    </div>
  );
};

export default Radio;
