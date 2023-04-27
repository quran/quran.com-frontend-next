/* eslint-disable max-lines */
import { useCallback, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';

import ReadingGoalInput from '../ReadingGoalInput';

import styles from './UpdateReadingGoalModal.module.scss';

import Button, { ButtonType, ButtonVariant } from '@/dls/Button/Button';
import Input, { InputSize } from '@/dls/Forms/Input';
import Select, { SelectSize } from '@/dls/Forms/Select';
import Modal from '@/dls/Modal/Modal';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { ReadingGoal, ReadingGoalType, UpdateReadingGoalRequest } from '@/types/auth/ReadingGoal';
import { updateReadingGoal } from '@/utils/auth/api';
import { makeStreakUrl } from '@/utils/auth/apiPaths';
import { logButtonClick } from '@/utils/eventLogger';
import { parseVerseRange } from '@/utils/verseKeys';

type UpdateReadingGoalButtonProps = {
  isDisabled?: boolean;
  readingGoal: ReadingGoal;
};

const getPages = (readingGoal: ReadingGoal) => {
  if (readingGoal.type === ReadingGoalType.PAGES) return Number(readingGoal.targetAmount);
  return 1;
};

const getSeconds = (readingGoal: ReadingGoal) => {
  if (readingGoal.type === ReadingGoalType.TIME) return Number(readingGoal.targetAmount);
  return 60;
};

const getRange = (readingGoal: ReadingGoal) => {
  if (readingGoal.type !== ReadingGoalType.RANGE) return { startVerse: null, endVerse: null };
  const [{ verseKey: startVerse }, { verseKey: endVerse }] = parseVerseRange(
    readingGoal.targetAmount,
  );

  return {
    startVerse,
    endVerse,
  };
};

const types = [
  { value: ReadingGoalType.TIME, key: 'time' },
  { value: ReadingGoalType.PAGES, key: 'pages' },
  { value: ReadingGoalType.RANGE, key: 'range' },
] as const;

const UpdateReadingGoalModal = ({ isDisabled, readingGoal }: UpdateReadingGoalButtonProps) => {
  const { t } = useTranslation('reading-goal');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [type, setType] = useState(readingGoal.type);

  const [pages, setPages] = useState(getPages(readingGoal));
  const [seconds, setSeconds] = useState(getSeconds(readingGoal));
  const [range, setRange] = useState(getRange(readingGoal));

  const [duration, setDuration] = useState(readingGoal.duration || 0);
  const toast = useToast();

  const { mutate } = useSWRConfig();

  const updateReadingGoalAndClearCache = useCallback(
    async (data: UpdateReadingGoalRequest) => {
      await updateReadingGoal(data).then(() => {
        mutate(makeStreakUrl());
      });
    },
    [mutate],
  );

  const closeModal = () => {
    setIsModalVisible(false);

    // reset everything to the reading goal
    setType(readingGoal.type);

    setPages(getPages(readingGoal));
    setSeconds(getSeconds(readingGoal));
    setRange(getRange(readingGoal));
  };

  const onUpdateGoalClicked = () => {
    logButtonClick('reading_goal_update_modal');
    setIsModalVisible(true);
  };

  const onUpdateClicked = async () => {
    logButtonClick('reading_goal_update');

    let amount: string | number;

    if (type === ReadingGoalType.PAGES) amount = pages;
    else if (type === ReadingGoalType.TIME) amount = seconds;
    else amount = `${range.startVerse}-${range.endVerse}`;

    const data: UpdateReadingGoalRequest = {
      type,
      amount,
    };
    if (duration) data.duration = duration;

    try {
      await updateReadingGoalAndClearCache(data);
      toast(t('update-reading-goal-success'), { status: ToastStatus.Success });
      closeModal();
    } catch {
      toast(t('common:error.general'), { status: ToastStatus.Error });
    }
  };

  return (
    <>
      <Button onClick={onUpdateGoalClicked} isDisabled={isDisabled}>
        {t('edit-goal')}
      </Button>
      <Modal isOpen={isModalVisible} onClickOutside={closeModal}>
        <Modal.Body>
          <Modal.Header>
            <Modal.Title>{t('delete-confirmation.title')}</Modal.Title>
            <Modal.Subtitle>{t('delete-confirmation.subtitle')}</Modal.Subtitle>

            <div className={styles.inputs}>
              <div className={styles.inputContainer}>
                <label htmlFor="goal-type" className={styles.label}>
                  {t('goal-type.title')}
                </label>
                <Select
                  id="goal-type"
                  name="goal-type"
                  value={type}
                  onChange={(key) => setType(ReadingGoalType[key] as ReadingGoalType)}
                  size={SelectSize.Large}
                  options={types.map((typeObject) => ({
                    value: typeObject.value,
                    label: t(`goal-types.${typeObject.key}.title`),
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
                logChange={() => {
                  // TODO: implement this when we uncomment the update modal
                }}
              />

              <div className={styles.inputContainer}>
                <label htmlFor="goal-duration" className={styles.label}>
                  {t('duration')}
                </label>
                <Input
                  id="goal-duration"
                  value={duration.toString()}
                  onChange={(d) => setDuration(Number(d))}
                  size={InputSize.Large}
                  fixedWidth={false}
                  htmlType="number"
                />
              </div>
            </div>
          </Modal.Header>
          <Modal.Footer>
            <Button
              type={ButtonType.Primary}
              variant={ButtonVariant.Outlined}
              className={styles.deleteButton}
              onClick={onUpdateClicked}
            >
              {t('edit-goal')}
            </Button>
          </Modal.Footer>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default UpdateReadingGoalModal;
