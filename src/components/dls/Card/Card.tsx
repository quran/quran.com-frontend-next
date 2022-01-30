import { ReactNode } from 'react';

import classNames from 'classnames';

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
  imgClassName?: string;
};

const Card = ({
  size,
  title,
  description,
  onImgClick,
  imgSrc,
  actionIcon,
  imgAlt,
  imgClassName,
}: CardProps) => {
  return (
    <div
      className={classNames(styles.container, {
        [styles.large]: size === CardSize.Large,
        [styles.medium]: size === CardSize.Medium,
      })}
    >
      <div
        className={classNames(styles.imageContainer, imgClassName)}
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
          <Button className={styles.playIconContainer} variant={ButtonVariant.Ghost}>
            {actionIcon}
          </Button>
        )}
      </div>
    </div>
  );
};

export default Card;
