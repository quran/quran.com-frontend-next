import Link from 'next/link';

import styles from './Banner.module.scss';

import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import useGetStreakWithMetadata from '@/hooks/auth/useGetStreakWithMetadata';
import useIsLoggedIn from '@/hooks/auth/useIsLoggedIn';
import DiamondIcon from '@/icons/diamond.svg';
import {
  getReadingGoalNavigationUrl,
  getReadingGoalProgressNavigationUrl,
} from '@/utils/navigation';

type BannerProps = {
  text: string;
  ctaButton?: React.ReactNode;
};

const Banner = ({ text, ctaButton }: BannerProps) => {
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
    <div className={styles.container}>
      <p className={styles.text}>{text}</p>
      {ctaButton && (
        <Link href={link} className={styles.cta}>
          <IconContainer icon={<DiamondIcon />} color={IconColor.primary} size={IconSize.Xsmall} />
          {ctaButton}
        </Link>
      )}
    </div>
  );
};

export default Banner;
