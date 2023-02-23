/* eslint-disable max-lines */
import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './CreateReadingGoalModal.module.scss';

import Counter from '@/dls/Counter/Counter';
import Input, { InputSize } from '@/dls/Forms/Input';
import Select from '@/dls/Forms/Select';
import Toggle from '@/dls/Toggle/Toggle';
import { ReadingGoalType } from '@/types/auth/ReadingGoal';

const types = [
  {
    value: ReadingGoalType.PAGES,
    label: 'Pages',
  },
  {
    value: ReadingGoalType.TIME,
    label: 'Time',
  },

  {
    value: ReadingGoalType.RANGE,
    label: 'Range',
  },
];

interface Props {
  type: ReadingGoalType;
  setType: (value: ReadingGoalType) => void;

  pages: number;
  setPages: (value: number) => void;

  seconds: number;
  setSeconds: (value: number) => void;

  duration: number | null;
  setDuration: (value: number | null) => void;

  rangeStartVerse: string | null;
  setRangeStartVerse: (value: string | null) => void;

  rangeEndVerse: string | null;
  setRangeEndVerse: (value: string | null) => void;
}

const FormTab: React.FC<Props> = ({
  type,
  setType,
  pages,
  setPages,
  seconds,
  setSeconds,
  duration,
  setDuration,
  rangeStartVerse,
  setRangeStartVerse,
  rangeEndVerse,
  setRangeEndVerse,
}) => {
  const { t } = useTranslation();
  const [isContinuious, setIsContinuious] = useState(duration !== null);

  const onTypeChange = (value: ReadingGoalType) => {
    setType(value);
  };

  const onPagesChange = (value: string) => {
    setPages(Number(value));
  };

  const onTimeIncrement = () => {
    setSeconds(seconds + 60);
  };

  const onTimeDecrement = () => {
    setSeconds(seconds - 60);
  };

  const onRangeChange = (value: { from?: string; to?: string }) => {
    if (value.from) setRangeStartVerse(value.from);
    if (value.to) setRangeEndVerse(value.to);
  };

  const getGoalAmountInput = () => {
    if (type === ReadingGoalType.PAGES) {
      return (
        <Input
          id="goal-amount"
          name="goal-amount"
          // type={InputType}
          htmlType="number"
          isRequired
          size={InputSize.Small}
          fixedWidth={false}
          value={pages.toString()}
          onChange={onPagesChange}
        />
      );
    }

    if (type === ReadingGoalType.RANGE) {
      return (
        <div className={styles.rangeContainer}>
          <div>
            <label htmlFor="from" className={styles.label}>
              {t('common:from')}
            </label>
            <Input
              id="from"
              name="from"
              htmlType="text"
              isRequired
              fixedWidth={false}
              value={rangeStartVerse || ''}
              onChange={(value) => onRangeChange({ from: value })}
            />
          </div>

          <div>
            <label htmlFor="to" className={styles.label}>
              {t('common:to')}
            </label>
            <Input
              id="to"
              name="to"
              htmlType="text"
              fixedWidth={false}
              isRequired
              value={rangeEndVerse || ''}
              onChange={(value) => onRangeChange({ to: value })}
            />
          </div>
        </div>
      );
    }

    if (type === ReadingGoalType.TIME) {
      const minValue = 60;
      const maxValue = 60 * 60 * 24;

      return (
        <Counter
          onIncrement={seconds < maxValue ? onTimeIncrement : null}
          onDecrement={seconds > minValue ? onTimeDecrement : null}
          count={(seconds / 60).toString()}
        />
      );
    }

    return null;
  };

  return (
    <>
      <div className={styles.inputContainer}>
        <label htmlFor="goal-type" className={styles.label}>
          {t('common:type')}
        </label>
        <Select
          id="goal-type"
          name="goal-type"
          options={types}
          value={type}
          onChange={onTypeChange}
        />
      </div>

      <div className={styles.inputContainer}>
        {type === ReadingGoalType.RANGE ? null : (
          <label htmlFor="goal-amount" className={styles.label}>
            {type === ReadingGoalType.PAGES ? t('common:pages') : 'Minutes'}
          </label>
        )}
        {getGoalAmountInput()}
      </div>

      <div className={styles.inputContainer}>
        <span className={styles.label}>{t('reading-goal:continuious')}</span>

        <Toggle isChecked={isContinuious} onClick={() => setIsContinuious(!isContinuious)} />
      </div>

      {isContinuious ? (
        <div className={styles.inputContainer}>
          <label htmlFor="duration" className={styles.label}>
            {t('reading-goal:days')}
          </label>
          <Input
            id="duration"
            name="duration"
            htmlType="number"
            isRequired
            size={InputSize.Small}
            fixedWidth={false}
            value={duration?.toString() || ''}
            onChange={(value) => setDuration(Number(value))}
          />
        </div>
      ) : null}
    </>
  );
};

export default FormTab;
