import styles from './RepeatSetting.module.scss';

import Counter from '@/dls/Counter/Counter';

type RepeatSettingProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix: string;
  minValue?: number;
  maxValue?: number;
  format?: (val: number) => string;
  step?: number;
  infinityThreshold?: number;
};

const RepeatSetting = ({
  label,
  value,
  onChange,
  minValue = 0,
  maxValue = Infinity,
  step = 1,
  suffix,
  infinityThreshold,
  format = (val: number) => val.toString(),
}: RepeatSettingProps) => {
  return (
    <div className={styles.inputContainer}>
      <span className={styles.label}>{label}</span>{' '}
      <span className={styles.input}>
        <Counter
          onIncrement={
            value < maxValue
              ? // when value is reaching infinityThreshold. set the value to Infinity
                // otherwise increment the value
                () => onChange(value >= infinityThreshold ? Infinity : value + step)
              : null
          }
          onDecrement={
            value > minValue
              ? // When the value equals to Infinity, set the value to `infinityThreshold`
                // otherwise decrement normally
                () => onChange(value === Infinity ? infinityThreshold : value - step)
              : null
          }
          count={format(value)}
        />{' '}
        {suffix}
      </span>
    </div>
  );
};

export default RepeatSetting;
