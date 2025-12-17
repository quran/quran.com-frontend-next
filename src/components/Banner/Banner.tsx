import { useCallback, useMemo } from 'react';

import styles from './Banner.module.scss';

import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import Link, { LinkVariant } from '@/dls/Link/Link';
import useGetStreakWithMetadata from '@/hooks/auth/useGetStreakWithMetadata';
import useIsLoggedIn from '@/hooks/auth/useIsLoggedIn';
import DiamondIcon from '@/icons/diamond.svg';
import { logButtonClick } from '@/utils/eventLogger';
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
  const { goal, isLoading } = useGetStreakWithMetadata();
  const hasGoal = !!goal;

  // Route logged-in users with an existing goal to the progress page,
  // otherwise route to the reading-goal page.
  // When isLoading is false, the API call has completed and hasGoal accurately reflects goal status.
  const ctaLink = useMemo(() => {
    return isLoggedIn && !isLoading && hasGoal
      ? getReadingGoalProgressNavigationUrl()
      : getReadingGoalNavigationUrl();
  }, [isLoggedIn, isLoading, hasGoal]);

  const handleButtonClick = useCallback(() => {
    logButtonClick('banner_cta', {
      hasGoal,
      isLoggedIn,
    });
  }, [hasGoal, isLoggedIn]);

  return (
    <div className={styles.container} data-testid="banner">
      <div className={styles.text}>{text}</div>
      {ctaButtonText && (
        <Link
          href={ctaLink}
          variant={LinkVariant.Blend}
          className={styles.cta}
          ariaLabel={ctaButtonText}
          onClick={handleButtonClick}
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
