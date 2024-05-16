/* eslint-disable max-lines */
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';

import ReadingGoalInput from '../ReadingGoalInput';

import styles from './UpdateReadingGoalModal.module.scss';

import { validateReadingGoalData } from '@/components/ReadingGoalPage/utils/validator';
import DataContext from '@/contexts/DataContext';
import Button, { ButtonType, ButtonVariant } from '@/dls/Button/Button';
import RadioGroup from '@/dls/Forms/RadioGroup/RadioGroup';
import { RadioRootOrientation } from '@/dls/Forms/RadioGroup/Root';
import Select, { SelectSize } from '@/dls/Forms/Select';
import Modal from '@/dls/Modal/Modal';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useGetMushaf from '@/hooks/useGetMushaf';
import {
  Goal,
  GoalCategory,
  GoalType,
  QuranGoalPeriod,
  UpdateGoalRequest,
} from '@/types/auth/Goal';
import { updateReadingGoal } from '@/utils/auth/api';
import { makeStreakUrl } from '@/utils/auth/apiPaths';
import { logButtonClick, logFormSubmission, logValueChange } from '@/utils/eventLogger';
import { generateDurationDaysOptions } from '@/utils/generators';
import { parseVerseRange } from '@/utils/verseKeys';

type UpdateReadingGoalButtonProps = {
  isDisabled?: boolean;
  goal: Goal;
};

const getPages = (readingGoal: Goal) => {
  if (readingGoal.type === GoalType.PAGES) return Number(readingGoal.targetAmount);
  return 1;
};

const getSeconds = (readingGoal: Goal) => {
  if (readingGoal.type === GoalType.TIME) return Number(readingGoal.targetAmount);
  return 60;
};

const getRange = (readingGoal: Goal) => {
  if (readingGoal.type !== GoalType.RANGE) return { startVerse: null, endVerse: null };
  const [{ verseKey: startVerse }, { verseKey: endVerse }] = parseVerseRange(
    readingGoal.targetAmount,
  );

  return {
    startVerse,
    endVerse,
  };
};

const types = [
  { value: GoalType.TIME, key: 'time' },
  { value: GoalType.PAGES, key: 'pages' },
  { value: GoalType.RANGE, key: 'range' },
] as const;

const UpdateReadingGoalModal = ({ isDisabled, goal }: UpdateReadingGoalButtonProps) => {
  const { t, lang } = useTranslation('reading-progress');
  const chaptersData = useContext(DataContext);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const mushaf = useGetMushaf();
  const dayOptions = useMemo(() => generateDurationDaysOptions(t, lang), [t, lang]);

  const [isContinuous, setIsContinuous] = useState(!!goal.duration);
  const [duration, setDuration] = useState(goal.duration || 30);
  const [type, setType] = useState(goal.type);

  const [pages, setPages] = useState(getPages(goal));
  const [seconds, setSeconds] = useState(getSeconds(goal));
  const [range, setRange] = useState(getRange(goal));

  const toast = useToast();

  const { mutate } = useSWRConfig();

  const updateReadingGoalAndClearCache = useCallback(
    async (data: UpdateGoalRequest) => {
      await updateReadingGoal({ ...data, mushafId: mushaf, category: GoalCategory.QURAN });
      mutate(makeStreakUrl());
    },
    [mutate, mushaf],
  );

  const resetState = useCallback(() => {
    // reset everything to the reading goal
    setType(goal.type);
    setIsContinuous(!!goal.duration);
    setDuration(goal.duration || 30);

    setPages(getPages(goal));
    setSeconds(getSeconds(goal));
    setRange(getRange(goal));
  }, [goal]);

  const closeModal = () => {
    setIsModalVisible(false);

    resetState();
  };

  useEffect(() => {
    resetState();
  }, [resetState, goal]);

  const onUpdateGoalClicked = () => {
    logButtonClick('edit_reading_goal');
    setIsModalVisible(true);
  };

  const onUpdateClicked = async () => {
    let amount: string | number;

    if (type === GoalType.PAGES) amount = pages;
    else if (type === GoalType.TIME) amount = seconds;
    else amount = `${range.startVerse}-${range.endVerse}`;

    const data: UpdateGoalRequest = {
      type,
      amount,
    };
    if (isContinuous) {
      data.duration = duration;
    }

    logFormSubmission('edit_goal', data);

    try {
      await updateReadingGoalAndClearCache(data);
      toast(t('edit-goal.success'), { status: ToastStatus.Success });
      closeModal();
    } catch {
      toast(t('common:error.general'), { status: ToastStatus.Error });
    }
  };

  const onContinuityChange = (value: QuranGoalPeriod) => {
    setIsContinuous(value === QuranGoalPeriod.Continuous);
    logValueChange(
      'edit_goal_continuity',
      isContinuous ? QuranGoalPeriod.Continuous : QuranGoalPeriod.Daily,
      value,
    );
  };

  const logAmountChange = (
    input: string,
    values: { currentValue: unknown; newValue: unknown },
    metadata?: Record<string, unknown>,
  ) => {
    logValueChange(`edit_goal_${input}`, values.currentValue, values.newValue, metadata);
  };

  const onGoalTypeChange = (newType: GoalType) => {
    setType(newType);
    logValueChange('edit_goal_type', type, newType);
  };

  const onDurationChange = (value: string) => {
    setDuration(Number(value));
    logValueChange('edit_goal_duration', duration, value);
  };

  const getIsUpdateDisabled = () => {
    return !validateReadingGoalData(
      chaptersData,
      {
        type,
        pages,
        seconds,
        range,
      },
      mushaf,
    );
  };

  return (
    <>
      <Button onClick={onUpdateGoalClicked} isDisabled={isDisabled}>
        {t('edit-goal.action')}
      </Button>

      <Modal isOpen={isModalVisible} onClickOutside={closeModal}>
        <Modal.Body>
          <Modal.Header>
            <Modal.Title>{t('edit-goal.title')}</Modal.Title>
            <Modal.Subtitle>{t('edit-goal.subtitle')}</Modal.Subtitle>

            <RadioGroup
              label="Continuity"
              orientation={RadioRootOrientation.Horizontal}
              value={isContinuous ? QuranGoalPeriod.Continuous : QuranGoalPeriod.Daily}
              onChange={onContinuityChange}
              className={styles.radioGroup}
              items={[
                {
                  id: QuranGoalPeriod.Continuous,
                  label: t('reading-goal:continuous.title'),
                  value: QuranGoalPeriod.Continuous,
                },
                {
                  id: QuranGoalPeriod.Daily,
                  label: t('reading-goal:daily.title'),
                  value: QuranGoalPeriod.Daily,
                },
              ]}
            />

            <div className={styles.inputs}>
              <div className={styles.inputContainer}>
                <label htmlFor="goal-type" className={styles.label}>
                  {t('reading-goal:goal-type.title')}
                </label>
                <Select
                  id="goal-type"
                  name="goal-type"
                  value={type}
                  onChange={onGoalTypeChange}
                  size={SelectSize.Large}
                  options={types.map((typeObject) => ({
                    value: typeObject.value,
                    label: t(`reading-goal:goal-types.${typeObject.key}.title`),
                  }))}
                />
              </div>

              <ReadingGoalInput
                type={type}
                pages={pages}
                seconds={seconds}
                rangeStartVerse={range.startVerse}
                rangeEndVerse={range.endVerse}
                onRangeChange={(newRange) => setRange(newRange)}
                onPagesChange={setPages}
                onSecondsChange={setSeconds}
                widthFull={false}
                logChange={logAmountChange}
              />

              {isContinuous && (
                <div className={styles.inputContainer}>
                  <label htmlFor="goal-duration" className={styles.label}>
                    {t('reading-goal:duration')}
                  </label>
                  <Select
                    id="duration"
                    name="duration"
                    size={SelectSize.Large}
                    className={styles.input}
                    options={dayOptions}
                    value={duration.toString()}
                    onChange={onDurationChange}
                  />
                </div>
              )}
            </div>
          </Modal.Header>
          <Modal.Footer>
            <Button
              type={ButtonType.Primary}
              variant={ButtonVariant.Outlined}
              className={styles.deleteButton}
              onClick={onUpdateClicked}
              isDisabled={getIsUpdateDisabled()}
            >
              {t('edit-goal.action')}
            </Button>
          </Modal.Footer>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default UpdateReadingGoalModal;
