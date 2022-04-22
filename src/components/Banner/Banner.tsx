// import { useDispatch } from 'react-redux';

// import CloseIcon from '../../../public/icons/close.svg';
import { useState } from 'react';

import classNames from 'classnames';
import { useSelector } from 'react-redux';

import MoonIllustrationSVG from '../../../public/images/moon-illustration.svg';
import Button, { ButtonSize, ButtonType } from '../dls/Button/Button';
import Spinner from '../dls/Spinner/Spinner';

import styles from './Banner.module.scss';

import { selectIsBannerVisible } from 'src/redux/slices/banner';

// import { setIsBannerVisible } from 'src/redux/slices/banner';
// import { logButtonClick } from 'src/utils/eventLogger';

type BannerProps = {
  onClick?: () => void;
  href?: string;
  text: string;
  cta: string;
};

const Banner = ({ text, cta }: BannerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const isBannerVisible = useSelector(selectIsBannerVisible);
  // const dispatch = useDispatch();
  // const closeBanner = () => {
  //   dispatch(setIsBannerVisible(false));
  //   logButtonClick('banner_close');
  // };

  const onDonateClicked = () => {
    // @ts-ignore
    window.givingloop('donate');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 5000);
  };

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
        <Button
          isNewTab
          onClick={onDonateClicked}
          className={styles.cta}
          size={ButtonSize.Small}
          type={ButtonType.Success}
          gl-donate-button=""
          data-gl-monthly="false"
          data-gl-amount="100"
          key="become-monthly-donor"
        >
          {isLoading ? <Spinner /> : cta}
        </Button>
      </div>
      {/* <div className={styles.closeButton}>
        <Button type={ButtonType.Success} variant={ButtonVariant.Compact} onClick={closeBanner}>
          <CloseIcon />
        </Button>
      </div> */}
    </div>
  );
};

export default Banner;
