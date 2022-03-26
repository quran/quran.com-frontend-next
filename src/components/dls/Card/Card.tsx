import { ReactNode } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import Button, { ButtonVariant } from '../Button/Button';

import styles from './Card.module.scss';

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
  imgAlt?: string;
  actionIcon?: ReactNode;
  shouldFlipIconOnRTL?: boolean;
  onActionIconClick?: () => void;
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
}: CardProps) => {
  const { t } = useTranslation('common');
  return (
    <div
      className={classNames(styles.container, {
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
        {imgSrc && <img alt={imgAlt} className={styles.img} src={imgSrc} />}

        {actionIcon && (
          <div className={styles.cardHoverEffectContainer} data-theme="dark">
            {actionIcon}
          </div>
        )}
      </div>
      <div className={styles.bodyContainer}>
        <div className={styles.textsContainer}>
          <div className={styles.title}>{title}</div>
          <div className={styles.description}>{description}</div>
        </div>
        {size === CardSize.Large && (
          <Button
            onClick={() => {
              if (onActionIconClick) onActionIconClick();
            }}
            className={styles.playIconContainer}
            variant={ButtonVariant.Ghost}
            shouldFlipOnRTL={shouldFlipIconOnRTL}
            tooltip={t('audio.play')}
            ariaLabel={t('audio.play')}
          >
            {actionIcon}
          </Button>
        )}
      </div>
    </div>
  );
};

export default Card;
