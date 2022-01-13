import classNames from 'classnames';

import PlayIcon from '../../../public/icons/play-outline.svg';
import Button, { ButtonVariant } from '../dls/Button/Button';

import styles from './PlaylistCard.module.scss';

export enum PlayListCardSize {
  Medium = 'medium',
  Large = 'large',
}

type PlayListCardProps = {
  size: PlayListCardSize;
  title: string;
  description?: string;
};

const PlaylistCard = ({ size, title, description }: PlayListCardProps) => {
  return (
    <div
      className={classNames(styles.container, {
        [styles.large]: size === PlayListCardSize.Large,
        [styles.medium]: size === PlayListCardSize.Medium,
      })}
    >
      <div className={styles.imageContainer} />
      <div className={styles.bodyContainer}>
        <div className={styles.textsContainer}>
          <div className={styles.title}>{title}</div>
          <div className={styles.description}>{description}</div>
        </div>
        {size === PlayListCardSize.Large && (
          <Button className={styles.playIconContainer} variant={ButtonVariant.Ghost}>
            <PlayIcon />
          </Button>
        )}
      </div>
    </div>
  );
};

export default PlaylistCard;
