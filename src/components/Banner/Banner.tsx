import classNames from 'classnames';
import Link from 'next/link';
import { useSelector } from 'react-redux';

import styles from './Banner.module.scss';

import useGetStreakWithMetadata from '@/hooks/auth/useGetStreakWithMetadata';
import useIsLoggedIn from '@/hooks/auth/useIsLoggedIn';
import MoonIllustrationSVG from '@/public/images/moon-illustration.svg';
import { selectIsBannerVisible } from '@/redux/slices/banner';
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
  const isLoggedIn = useIsLoggedIn();
  const { goal, isLoading } = useGetStreakWithMetadata();
  const hasGoal = !!goal;

  // Route logged-in users to progress page while loading to prevent jarring UX
  // if they have an existing goal. Falls back to reading-goal once loading completes
  // if no goal exists.
  const link =
    !isLoggedIn || (!hasGoal && !isLoading)
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
