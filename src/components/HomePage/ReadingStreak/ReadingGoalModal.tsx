/* eslint-disable max-lines */
import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './ReadingGoalModal.module.scss';

import Button from '@/dls/Button/Button';
import Counter from '@/dls/Counter/Counter';
import Input, { InputSize } from '@/dls/Forms/Input';
import Select from '@/dls/Forms/Select';
import Modal from '@/dls/Modal/Modal';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import Toggle from '@/dls/Toggle/Toggle';
import { CreateReadingGoalRequest, ReadingGoalType } from '@/types/auth/ReadingGoal';
import { addReadingGoal } from '@/utils/auth/api';

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

const ReadingGoalModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toast = useToast();
  const { t } = useTranslation();
  const [type, setType] = useState<ReadingGoalType>(ReadingGoalType.PAGES);
  const [isContinuious, setIsContinuious] = useState(false);
  const [pages, setPages] = useState(1);
  const [seconds, setSeconds] = useState(60);
  const [duration, setDuration] = useState<number | null>(null);
  const [rangeStartVerse, setRangeStartVerse] = useState<string | null>(null);
  const [rangeEndVerse, setRangeEndVerse] = useState<string | null>(null);

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

  const onClose = () => {
    setIsOpen(false);
  };

  const onSubmit = async () => {
    let amount: string | number;

    if (type === ReadingGoalType.PAGES) amount = pages;
    else if (type === ReadingGoalType.TIME) amount = seconds;
    else amount = `${rangeStartVerse}-${rangeEndVerse}`;

    const data: CreateReadingGoalRequest = {
      type,
      amount,
    };
    if (duration) data.duration = duration;

    try {
      await addReadingGoal(data);
      toast(t('reading-goal:set-reading-goal-success'), {
        status: ToastStatus.Success,
      });
      onClose();
    } catch (e) {
      toast(t('common:error.general'), {
        status: ToastStatus.Error,
      });
    }
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
      <Button onClick={() => setIsOpen(true)}>{t('reading-goal:set-reading-goal')}</Button>

      <Modal isOpen={isOpen} onClickOutside={onClose}>
        <Modal.Body>
          <Modal.Header>
            <Modal.Title>{t('reading-goal:reading-goal')}</Modal.Title>
          </Modal.Header>
          <div className={styles.container}>
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
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Modal.Action onClick={onClose}>{t('common:cancel')}</Modal.Action>
          <Modal.Action onClick={onSubmit}>{t('common:submit')}</Modal.Action>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ReadingGoalModal;
