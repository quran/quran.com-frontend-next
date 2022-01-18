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
  title: string;
  description?: string;
  onClick?: () => void;
  imgSrc?: string;
  actionIcon?: ReactNode;
};

const Card = ({ size, title, description, onClick, imgSrc, actionIcon }: CardProps) => {
  return (
    <div
      role="button"
      tabIndex={0}
      onKeyPress={onClick}
      onClick={onClick}
      className={classNames(styles.container, {
        [styles.large]: size === CardSize.Large,
        [styles.medium]: size === CardSize.Medium,
      })}
    >
      <div className={styles.imageContainer}>
        {imgSrc && <img alt={title} className={styles.img} src={imgSrc} />}

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
