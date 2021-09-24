import React from 'react';

import * as SliderPrimitive from '@radix-ui/react-slider';

import styles from './Slider.module.scss';

export enum Orientation {
  Horizontal = 'horizontal',
  Vertical = 'vertical',
}

export enum Direction {
  ltr = 'ltr',
  rtl = 'rtl',
}

interface Props {
  label: string;
  name?: string;
  disabled?: boolean;
  orientation?: Orientation;
  direction?: Direction;
  value?: number[];
  defaultValue?: number[];
  min?: number;
  max?: number;
  step?: number;
  minStepsBetweenThumbs?: number;
  onValueChange?: (value: number[]) => void;
  showThumbs?: boolean;
}

const Slider: React.FC<Props> = ({
  label,
  name,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  minStepsBetweenThumbs = 0,
  direction = Direction.ltr,
  orientation = Orientation.Horizontal,
  disabled = false,
  defaultValue,
  value,
  showThumbs = true,
}) => {
  const values = value || defaultValue;

  return (
    <SliderPrimitive.Slider
      className={styles.slider}
      min={min}
      max={max}
      step={step}
      minStepsBetweenThumbs={minStepsBetweenThumbs}
      dir={direction}
      orientation={orientation}
      disabled={disabled}
      aria-label={label}
      {...(defaultValue && { defaultValue })}
      {...(value && { value })}
      {...(onValueChange && { onValueChange })}
      {...(name && { name })}
    >
      <SliderPrimitive.Track className={styles.track}>
        <SliderPrimitive.Range className={styles.range} />
      </SliderPrimitive.Track>
      {showThumbs &&
        values.map((...[, index]) => (
          <SliderPrimitive.Thumb className={styles.thumb} key={index} />
        ))}
    </SliderPrimitive.Slider>
  );
};
export default Slider;
