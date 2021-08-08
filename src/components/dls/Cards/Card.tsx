import React from 'react';
import Image from 'next/image';
import styles from './Card.module.scss';

type CardProps = {
  title: string;
  subtitle: string;
  image: string;
};

const DIMENSIONS = {
  WIDTH: 360,
  HEIGHT: 180,
};

const Card = ({ title, subtitle, image }: CardProps) => (
  <figure className={styles.container}>
    <Image
      src={image}
      role="presentation"
      alt={title}
      width={DIMENSIONS.WIDTH}
      height={DIMENSIONS.HEIGHT}
      className={styles.image}
    />
    <div className={styles.caption}>
      <div>
        <h3 className={styles.title}>{title}</h3>
        <p>{subtitle}</p>
      </div>
    </div>
  </figure>
);

export default Card;
