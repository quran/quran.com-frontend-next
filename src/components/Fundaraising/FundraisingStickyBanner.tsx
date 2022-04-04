import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import CloseIcon from '../../../public/icons/close.svg';
import MoonIllustrationSVG from '../../../public/images/moon-illustration.svg';
import Button, { ButtonSize, ButtonType, ButtonVariant } from '../dls/Button/Button';

import styles from './FundraisingStickyHeader.module.scss';

import { setIsBannerVisible } from 'src/redux/slices/banner';

const FundraisingStickyBanner = () => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const closeBanner = () => {
    dispatch(setIsBannerVisible(false));
  };
  return (
    <div className={styles.container}>
      <div className={styles.description}>
        <div className={styles.illustrationContainer}>
          <MoonIllustrationSVG />
        </div>
        <div>{t('fundraising-sticky-banner.title')}</div>
      </div>
      <div className={styles.ctaContainer}>
        <Button className={styles.cta} size={ButtonSize.Small} type={ButtonType.Success}>
          {t('fundraising-sticky-banner.cta')}
        </Button>
      </div>
      <div className={styles.closeButton}>
        <Button type={ButtonType.Success} variant={ButtonVariant.Compact} onClick={closeBanner}>
          <CloseIcon />
        </Button>
      </div>
    </div>
  );
};

export default FundraisingStickyBanner;
