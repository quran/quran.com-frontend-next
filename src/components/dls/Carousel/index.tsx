import { ReactNode } from 'react';

import styles from './Carousel.module.scss';

type CarouselProps = {
  slides: {
    id: string;
    component: ReactNode;
  }[];
};

const Carousel = ({ slides }: CarouselProps) => {
  return (
    <div>
      <div className={styles.container}>
        {slides.map((slide) => (
          <div key={slide.id} className={styles.slide} id={slide.id}>
            {slide.component}
          </div>
        ))}
      </div>
      <div className={styles.dotsContainer}>
        {slides.map((slide) => (
          <div key={slide.id} className={styles.dot} />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
