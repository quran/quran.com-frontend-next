/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { ReactNode } from 'react';

import classNames from 'classnames';

import PlayIcon from '../../../../public/icons/play-arrow.svg';
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
  hoverIcon?: ReactNode;
};

const Card = ({ size, title, description, onClick, imgSrc, hoverIcon }: CardProps) => {
  return (
    <div
      onClick={onClick}
      className={classNames(styles.container, {
        [styles.large]: size === CardSize.Large,
        [styles.medium]: size === CardSize.Medium,
      })}
    >
      <div className={styles.imageContainer}>
        {imgSrc && <img alt={title} className={styles.img} src={imgSrc} />}

        {hoverIcon && (
          <div className={styles.cardHoverEffectContainer} data-theme="dark">
            {hoverIcon}
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
            <PlayIcon />
          </Button>
        )}
      </div>
    </div>
  );
};

export default Card;
