import { ChangeEvent, useEffect, useState } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './DurationInput.module.scss';

import { convertNumberToDecimal } from '@/utils/number';

interface DurationInputProps {
  totalSeconds: number;
  onTotalSecondsChange: (totalSeconds: number) => void;
  disabled?: boolean;
  label?: string;
}

const commonInputProps: React.InputHTMLAttributes<HTMLInputElement> = {
  type: 'number',
  min: 0,
};

const DurationInput = ({
  totalSeconds,
  onTotalSecondsChange,
  disabled,
  label,
}: DurationInputProps) => {
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const { t } = useTranslation('common');

  const handleChange = (setter: (value: number) => void) => (e: ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value < 0) return;

    setter(value);
  };

  useEffect(() => {
    onTotalSecondsChange(hours * 3600 + minutes * 60 + seconds);
  }, [onTotalSecondsChange, hours, minutes, seconds]);

  useEffect(() => {
    const newHours = Math.floor(totalSeconds / 3600);
    const newMinutes = Math.floor((totalSeconds % 3600) / 60);
    const newSeconds = totalSeconds % 60;

    setHours(convertNumberToDecimal(newHours, 1));
    setMinutes(convertNumberToDecimal(newMinutes, 1));
    setSeconds(convertNumberToDecimal(newSeconds, 1));
  }, [totalSeconds]);

  return (
    <div>
      {label && (
        <label className={styles.label} htmlFor="hours">
          {label}
        </label>
      )}

      <div className={classNames(styles.durationInputContainer, disabled && styles.disabled)}>
        <div>
          <input
            value={hours.toString()}
            id="hours"
            onChange={handleChange(setHours)}
            disabled={disabled}
            {...commonInputProps}
          />
          <label htmlFor="hours">{t('hours')}</label>
        </div>

        <div>
          <input
            value={minutes.toString()}
            id="minutes"
            onChange={handleChange(setMinutes)}
            disabled={disabled}
            {...commonInputProps}
          />
          <label htmlFor="minutes">{t('minutes')}</label>
        </div>

        <div>
          <input
            value={seconds.toString()}
            id="seconds"
            onChange={handleChange(setSeconds)}
            disabled={disabled}
            {...commonInputProps}
          />
          <label htmlFor="seconds">{t('seconds')}</label>
        </div>
      </div>
    </div>
  );
};

export default DurationInput;
