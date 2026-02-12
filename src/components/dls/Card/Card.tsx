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
  descriptionClassName?: string;
  onImgClick?: () => void;
  imgSrc?: string;
  className?: string;
  imgAlt?: string;
  imgFit?: 'cover' | 'contain';
  footer?: ReactNode;
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
  imgFit = 'cover',
  footer,
  shouldFlipIconOnRTL = true,
  onActionIconClick,
  className,
  shouldShowFullTitle = false,
  ariaLabel,
  tooltip,
  descriptionClassName,
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
        {imgSrc && (
          <Image
            alt={imgAlt}
            className={styles.img}
            src={imgSrc}
            layout="fill"
            style={{ objectFit: imgFit }}
          />
        )}

        {actionIcon && (
          <div className={styles.cardHoverEffectContainer} data-theme="dark">
            {actionIcon}
          </div>
        )}
      </div>
      <div className={classNames(styles.bodyContainer, { [styles.hasFooter]: Boolean(footer) })}>
        <div className={styles.textsContainer}>
          <div
            className={classNames({
              [styles.title]: !shouldShowFullTitle,
            })}
          >
            {title}
          </div>
          <div className={classNames(styles.description, descriptionClassName)}>{description}</div>
        </div>
        {footer ? <div className={styles.footer}>{footer}</div> : null}
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
