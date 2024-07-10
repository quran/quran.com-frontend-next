import classNames from 'classnames';
import { useSelector } from 'react-redux';

import styles from './Banner.module.scss';

import MoonIllustrationSVG from '@/public/images/moon-illustration.svg';
import { selectIsBannerVisible } from '@/redux/slices/banner';

type BannerProps = {
  text: string;
  ctaButton?: React.ReactNode;
};

const Banner = ({ text, ctaButton }: BannerProps) => {
  const isBannerVisible = useSelector(selectIsBannerVisible);

  return (
    <div
      className={classNames(styles.container, {
        [styles.isVisible]: isBannerVisible,
      })}
    >
      <div className={styles.description}>
        <div className={styles.illustrationContainer}>
          <MoonIllustrationSVG />
        </div>
        <div className={styles.text}>{text}</div>
      </div>
      {ctaButton && <div className={styles.ctaContainer}>{ctaButton}</div>}
    </div>
  );
};

export default Banner;
