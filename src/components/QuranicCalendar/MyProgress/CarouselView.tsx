import React from 'react';

import MonthCard from './MonthCard';
import styles from './MyProgress.module.scss';
import { ProcessedMonth, ProcessedWeek } from './types';

import Carousel from '@/dls/Carousel';

interface CarouselViewProps {
  monthSlides: {
    id: string;
    month: ProcessedMonth;
  }[];
  getWeekClass: (week: ProcessedWeek) => string;
  isProgramCompleted?: boolean;
}

const CarouselView: React.FC<CarouselViewProps> = ({
  monthSlides,
  getWeekClass,
  isProgramCompleted,
}) => {
  // Format slides for the carousel component
  const slides = monthSlides.map(({ id, month }) => ({
    id,
    component: (
      <MonthCard
        month={month}
        getWeekClass={getWeekClass}
        isProgramCompleted={isProgramCompleted}
      />
    ),
  }));

  return (
    <div className={styles.mobileModeContainer}>
      <Carousel slides={slides} />
    </div>
  );
};

export default CarouselView;
