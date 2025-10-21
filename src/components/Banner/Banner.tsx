import classNames from 'classnames';
import Link from 'next/link';
import { useSelector } from 'react-redux';

import styles from './Banner.module.scss';

import useGetStreakWithMetadata from '@/hooks/auth/useGetStreakWithMetadata';
import MoonIllustrationSVG from '@/public/images/moon-illustration.svg';
import { selectIsBannerVisible } from '@/redux/slices/banner';
import { isLoggedIn } from '@/utils/auth/login';
import {
  getReadingGoalNavigationUrl,
  getReadingGoalProgressNavigationUrl,
} from '@/utils/navigation';

type BannerProps = {
  text: string;
  ctaButton?: React.ReactNode;
  shouldShowPrefixIcon?: boolean;
};

const Banner = ({ text, ctaButton, shouldShowPrefixIcon = true }: BannerProps) => {
  const isBannerVisible = useSelector(selectIsBannerVisible);
  const { goal, isLoading } = useGetStreakWithMetadata();
  const hasGoal = !!goal;

  const link =
    !isLoggedIn() || (!hasGoal && !isLoading)
      ? getReadingGoalNavigationUrl()
      : getReadingGoalProgressNavigationUrl();

  return (
    <div
      className={classNames(styles.container, {
        [styles.isVisible]: isBannerVisible,
      })}
    >
      <div className={styles.description}>
        {shouldShowPrefixIcon && (
          <div className={styles.illustrationContainer}>
            <MoonIllustrationSVG />
          </div>
        )}
        <div className={styles.text}>{text}</div>
      </div>
      {ctaButton && (
        <Link href={link} className={styles.ctaContainer}>
          {ctaButton}
        </Link>
      )}
    </div>
  );
};

export default Banner;
