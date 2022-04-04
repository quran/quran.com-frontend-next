import { useDispatch } from 'react-redux';

import CloseIcon from '../../../public/icons/close.svg';
import MoonIllustrationSVG from '../../../public/images/moon-illustration.svg';
import Button, { ButtonSize, ButtonType, ButtonVariant } from '../dls/Button/Button';

import styles from './Banner.module.scss';

import { setIsBannerVisible } from 'src/redux/slices/banner';

type BannerProps = {
  onClick?: () => void;
  href?: string;
  text: string;
  cta: string;
};

const Banner = ({ text, href, cta, onClick }: BannerProps) => {
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
        <div className={styles.text}>{text}</div>
      </div>
      <div className={styles.ctaContainer}>
        <Button
          isNewTab
          href={href}
          onClick={onClick}
          className={styles.cta}
          size={ButtonSize.Small}
          type={ButtonType.Success}
        >
          {cta}
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

export default Banner;
