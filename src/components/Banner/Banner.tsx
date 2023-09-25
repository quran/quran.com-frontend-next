import classNames from 'classnames';
import { useSelector } from 'react-redux';

import DonateButton from '../Fundraising/DonateButton';

import styles from './Banner.module.scss';

import MoonIllustrationSVG from '@/public/images/moon-illustration.svg';
import { selectIsBannerVisible } from '@/redux/slices/banner';
import DonateButtonClickSource from '@/types/DonateButtonClickSource';

type BannerProps = {
  text: string;
};

const Banner = ({ text }: BannerProps) => {
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
      <div className={styles.ctaContainer}>
        <DonateButton source={DonateButtonClickSource.BANNER} />
      </div>
    </div>
  );
};

export default Banner;
