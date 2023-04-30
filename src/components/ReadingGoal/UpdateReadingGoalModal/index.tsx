/* eslint-disable max-lines */
import { useCallback, useMemo, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector, shallowEqual } from 'react-redux';
import { useSWRConfig } from 'swr';

import ReadingGoalInput from '../ReadingGoalInput';

import styles from './UpdateReadingGoalModal.module.scss';

import Button, { ButtonType, ButtonVariant } from '@/dls/Button/Button';
import RadioGroup from '@/dls/Forms/RadioGroup/RadioGroup';
import { RadioRootOrientation } from '@/dls/Forms/RadioGroup/Root';
import Select, { SelectSize } from '@/dls/Forms/Select';
import Modal from '@/dls/Modal/Modal';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { selectQuranFont, selectQuranMushafLines } from '@/redux/slices/QuranReader/styles';
import { ReadingGoal, ReadingGoalType, UpdateReadingGoalRequest } from '@/types/auth/ReadingGoal';
import { getMushafId } from '@/utils/api';
import { updateReadingGoal } from '@/utils/auth/api';
import { makeStreakUrl } from '@/utils/auth/apiPaths';
import { logButtonClick } from '@/utils/eventLogger';
import { generateDurationDaysOptions } from '@/utils/generators';
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
  const { t, lang } = useTranslation('reading-progress');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const quranFont = useSelector(selectQuranFont, shallowEqual);
  const mushafLines = useSelector(selectQuranMushafLines, shallowEqual);
  const { mushaf } = getMushafId(quranFont, mushafLines);
  const dayOptions = useMemo(() => generateDurationDaysOptions(t, lang), [t, lang]);

  const [isContinuous, setIsContinuous] = useState(!!readingGoal.duration);
  const [duration, setDuration] = useState(readingGoal.duration || 30);
  const [type, setType] = useState(readingGoal.type);

  const [pages, setPages] = useState(getPages(readingGoal));
  const [seconds, setSeconds] = useState(getSeconds(readingGoal));
  const [range, setRange] = useState(getRange(readingGoal));

  const toast = useToast();

  const { mutate } = useSWRConfig();

  const updateReadingGoalAndClearCache = useCallback(
    async (data: UpdateReadingGoalRequest) => {
      await updateReadingGoal({ ...data, mushafId: mushaf });
      mutate(makeStreakUrl());
    },
    [mutate, mushaf],
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
    if (isContinuous) data.duration = duration;

    try {
      await updateReadingGoalAndClearCache(data);
      toast(t('edit-goal.success'), { status: ToastStatus.Success });
      closeModal();
    } catch {
      toast(t('common:error.general'), { status: ToastStatus.Error });
    }
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

            {/* <div className={styles.radioGroup}> */}
            <RadioGroup.Root
              label="Continuity"
              orientation={RadioRootOrientation.Horizontal}
              value={isContinuous ? 'continuous' : 'daily'}
              onChange={(value) => setIsContinuous(value === 'continuous')}
              className={styles.radioGroup}
            >
              <div className={styles.radioItem}>
                <RadioGroup.Item value="continuous" />
                {t('reading-goal:continuous.title')}
              </div>

              <div className={styles.radioItem}>
                <RadioGroup.Item value="daily" />
                {t('reading-goal:daily.title')}
              </div>
            </RadioGroup.Root>
            {/* </div> */}

            <div className={styles.inputs}>
              <div className={styles.inputContainer}>
                <label htmlFor="goal-type" className={styles.label}>
                  {t('reading-goal:goal-type.title')}
                </label>
                <Select
                  id="goal-type"
                  name="goal-type"
                  value={type}
                  onChange={(key) => setType(ReadingGoalType[key] as ReadingGoalType)}
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
                logChange={() => {
                  // TODO: implement this when we uncomment the update modal
                }}
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
                    onChange={(value) => {
                      setDuration(Number(value));
                    }}
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
