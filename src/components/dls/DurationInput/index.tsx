import { ChangeEvent, useEffect, useState } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './DurationInput.module.scss';

import Spinner from '@/dls/Spinner/Spinner';
import { convertNumberToDecimal } from '@/utils/number';

interface DurationInputProps {
  totalSeconds: number;
  onTotalSecondsChange: (totalSeconds: number) => void;
  disabled?: boolean;
  isLoading?: boolean;
  label?: React.ReactNode;
  error?: string;
}

const commonInputProps: React.InputHTMLAttributes<HTMLInputElement> = {
  type: 'number',
  min: 0,
};

const DurationInput = ({
  totalSeconds,
  onTotalSecondsChange,
  disabled = false,
  isLoading = false,
  label,
  error,
}: DurationInputProps) => {
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const { t } = useTranslation('common');

  const isDisabled = disabled || isLoading;

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

  const commonInputClassName = classNames({
    [styles.disabledInput]: isDisabled,
  });

  return (
    <div>
      {isLoading && <Spinner className={styles.loadingSpinner} />}
      {label && (
        <label className={styles.label} htmlFor="hours">
          {label}
        </label>
      )}

      <div
        className={classNames(
          styles.durationInputContainer,
          isDisabled && styles.disabled,
          error && styles.error,
        )}
      >
        <div>
          <input
            value={hours.toString()}
            id="hours"
            onChange={handleChange(setHours)}
            disabled={isDisabled}
            className={commonInputClassName}
            {...commonInputProps}
          />
          <label htmlFor="hours">{t('hours')}</label>
        </div>

        <div>
          <input
            value={minutes.toString()}
            id="minutes"
            onChange={handleChange(setMinutes)}
            disabled={isDisabled}
            className={commonInputClassName}
            {...commonInputProps}
          />
          <label htmlFor="minutes">{t('minutes')}</label>
        </div>

        <div>
          <input
            value={seconds.toString()}
            id="seconds"
            onChange={handleChange(setSeconds)}
            disabled={isDisabled}
            className={commonInputClassName}
            {...commonInputProps}
          />
          <label htmlFor="seconds">{t('seconds')}</label>
        </div>
      </div>

      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
};

export default DurationInput;
