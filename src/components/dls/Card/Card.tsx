import { ReactNode } from 'react';

import classNames from 'classnames';
import Image from 'next/image';

import styles from './Card.module.scss';

import Button, { ButtonVariant } from '@/dls/Button/Button';

export enum CardSize {
  Medium = 'medium',
  Large = 'large',
}

type CardProps = {
  size: CardSize;
  title: React.ReactNode;
  description?: React.ReactNode;
  onImgClick?: () => void;
  imgSrc?: string;
  className?: string;
  imgAlt?: string;
  actionIcon?: ReactNode;
  shouldFlipIconOnRTL?: boolean;
  onActionIconClick?: () => void;
  shouldShowFullTitle?: boolean;
  ariaLabel?: string;
  tooltip?: string;
};

const Card = ({
  size,
  title,
  description,
  onImgClick,
  imgSrc,
  actionIcon,
  imgAlt,
  shouldFlipIconOnRTL = true,
  onActionIconClick,
  className,
  shouldShowFullTitle = false,
  ariaLabel,
  tooltip,
}: CardProps) => {
  return (
    <div
      className={classNames(className, styles.container, {
        [styles.large]: size === CardSize.Large,
        [styles.medium]: size === CardSize.Medium,
      })}
    >
      <div
        className={classNames(styles.imageContainer)}
        role="button"
        tabIndex={0}
        onKeyPress={onImgClick}
        onClick={onImgClick}
      >
        {imgSrc && <Image alt={imgAlt} className={styles.img} src={imgSrc} layout="fill" />}

        {actionIcon && (
          <div className={styles.cardHoverEffectContainer} data-theme="dark">
            {actionIcon}
          </div>
        )}
      </div>
      <div className={styles.bodyContainer}>
        <div className={styles.textsContainer}>
          <div
            className={classNames({
              [styles.title]: !shouldShowFullTitle,
            })}
          >
            {title}
          </div>
          <div className={styles.description}>{description}</div>
        </div>
        {size === CardSize.Large && actionIcon && (
          <Button
            onClick={() => {
              if (onActionIconClick) onActionIconClick();
            }}
            className={styles.playIconContainer}
            variant={ButtonVariant.Ghost}
            shouldFlipOnRTL={shouldFlipIconOnRTL}
            tooltip={tooltip}
            ariaLabel={ariaLabel}
          >
            {actionIcon}
          </Button>
        )}
      </div>
    </div>
  );
};

export default Card;
