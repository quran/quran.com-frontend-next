import { ReactNode } from 'react';

import styles from './Carousel.module.scss';

type CarouselProps = {
  items: {
    id: string;
    component: ReactNode;
  }[];
};

const Carousel = ({ items }: CarouselProps) => {
  return (
    <div>
      <div className={styles.container}>
        {items.map((item) => (
          <div key={item.id} className={styles.slide} id={item.id}>
            {item.component}
          </div>
        ))}
      </div>
      <div className={styles.dotsContainer}>
        {items.map((item) => (
          <div key={item.id} className={styles.dot} />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
