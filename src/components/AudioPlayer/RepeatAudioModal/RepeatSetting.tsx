import styles from './RepeatSetting.module.scss';

import Counter from 'src/components/dls/Counter/Counter';

type RepeatSettingProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix: string;
  minValue?: number;
  maxValue?: number;
  format?: (val: number) => string;
  step?: number;
};
const RepeatSetting = ({
  label,
  value,
  onChange,
  minValue = 0,
  maxValue = Infinity,
  step = 1,
  format = (val: number) => val.toString(),
}: RepeatSettingProps) => {
  return (
    <div className={styles.inputContainer}>
      <span className={styles.label}>{label}</span>{' '}
      <span className={styles.input}>
        <Counter
          onIncrement={value < maxValue ? () => onChange(value + step) : null}
          onDecrement={value > minValue ? () => onChange(value - step) : null}
          count={format(value)}
        />{' '}
        times
      </span>
    </div>
  );
};

export default RepeatSetting;
