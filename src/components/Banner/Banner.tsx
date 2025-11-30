import styles from './Banner.module.scss';

import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import Link, { LinkVariant } from '@/dls/Link/Link';
import useGetStreakWithMetadata from '@/hooks/auth/useGetStreakWithMetadata';
import useIsLoggedIn from '@/hooks/auth/useIsLoggedIn';
import DiamondIcon from '@/icons/diamond.svg';
import {
  getReadingGoalNavigationUrl,
  getReadingGoalProgressNavigationUrl,
} from '@/utils/navigation';

interface BannerProps {
  text: string;
  ctaButtonText?: string;
}

const Banner = ({ text, ctaButtonText }: BannerProps) => {
  const isLoggedIn = useIsLoggedIn();
  const { goal } = useGetStreakWithMetadata();
  const hasGoal = !!goal;

  // Route logged-in users to progress page while loading to prevent jarring UX
  // if they have an existing goal. Falls back to reading-goal once loading completes
  // if no goal exists.
  const ctaLink =
    isLoggedIn && hasGoal ? getReadingGoalProgressNavigationUrl() : getReadingGoalNavigationUrl();

  return (
    <div className={styles.container} data-testid="banner">
      <p className={styles.text}>{text}</p>
      {ctaButtonText && (
        <Link
          href={ctaLink}
          variant={LinkVariant.Blend}
          className={styles.cta}
          ariaLabel={ctaButtonText}
        >
          <IconContainer
            icon={<DiamondIcon aria-hidden="true" />}
            size={IconSize.Xsmall}
            className={styles.icon}
            color={IconColor.tertiary}
          />
          {ctaButtonText}
        </Link>
      )}
    </div>
  );
};

export default Banner;
