/* eslint-disable max-lines */
import { useMemo, useState, useContext, useEffect } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';
import useSWRImmutable from 'swr/immutable';

import styles from './AddReading.module.scss';

import VerseRangesList from '@/components/ReadingGoal/ReadingGoalAmount/VerseRangesList';
import VerseRangeInput from '@/components/ReadingGoal/ReadingGoalInput/VerseRangeInput';
import { isValidVerseRange } from '@/components/ReadingGoalPage/utils/validator';
import DataContext from '@/contexts/DataContext';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import Calendar from '@/dls/Calendar';
import DurationInput from '@/dls/DurationInput';
import { ModalSize } from '@/dls/Modal/Content';
import Modal from '@/dls/Modal/Modal';
import Spinner from '@/dls/Spinner/Spinner';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useGetMushaf from '@/hooks/useGetMushaf';
import ChevronLeft from '@/icons/chevron-left.svg';
import ChevronRight from '@/icons/chevron-right.svg';
import ArrowLeft from '@/icons/west.svg';
import { ActivityDayType } from '@/types/auth/ActivityDay';
import { getFilterActivityDaysParamsOfCurrentMonth } from '@/utils/activity-day';
import { estimateReadingTime, updateActivityDay } from '@/utils/auth/api';
import {
  makeEstimateReadingTimeUrl,
  makeFilterActivityDaysUrl,
  makeStreakUrl,
} from '@/utils/auth/apiPaths';
import {
  dateToDateString,
  dateToReadableFormat,
  dateToYearMonthDay,
  getCurrentMonth,
  getMonthDateObject,
  getMonthsInYear,
} from '@/utils/datetime';
import { logValueChange, logButtonClick, logFormSubmission } from '@/utils/eventLogger';

const AddReading = () => {
  const chaptersData = useContext(DataContext);
  const { t, lang } = useTranslation('reading-progress');
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [rangeEnd, setRangeEnd] = useState<string | null>(null);
  const [ranges, setRanges] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number>(() => getCurrentMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const selectedYear = useMemo(() => new Date().getFullYear(), []);
  const months = useMemo(() => getMonthsInYear(selectedYear, lang), [selectedYear, lang]);
  const mushaf = useGetMushaf();
  const toast = useToast();
  const { cache, mutate } = useSWRConfig();

  const [totalSeconds, setTotalSeconds] = useState<number>(0);
  const { isValidating, data } = useSWRImmutable(makeEstimateReadingTimeUrl({ ranges }), () =>
    estimateReadingTime({ ranges }),
  );

  useEffect(() => {
    setTotalSeconds(data?.data?.seconds || 0);
  }, [data]);

  const onClose = () => {
    setIsOpen(false);
    // reset ranges
    setRanges([]);
    // reset selected date
    setSelectedDate(null);
  };

  const onOpenClick = () => {
    logButtonClick('open_add_reading_modal');
    setIsOpen(true);
  };

  const selectedMonthObj = useMemo(() => {
    if (!selectedMonth) return null;
    return months.find((month) => month.id === selectedMonth);
  }, [selectedMonth, months]);

  const onMonthBackClick = () => {
    const newMonth = selectedMonth - 1;
    logValueChange('add_reading_month', selectedMonth, newMonth, {
      year: selectedYear,
    });
    setSelectedMonth(newMonth);
  };

  const onMonthForwardClick = () => {
    const newMonth = selectedMonth + 1;
    logValueChange('add_reading_month', selectedMonth, newMonth, {
      year: selectedYear,
    });
    setSelectedMonth(newMonth);
  };

  const onAddClick = () => {
    if (!rangeStart || !rangeEnd) return;
    const newRanges = [...ranges, `${rangeStart}-${rangeEnd}`];
    logButtonClick('add_reading', {
      range: `${rangeStart}-${rangeEnd}`,
    });
    setRanges(newRanges);
    setRangeStart(undefined);
    setRangeEnd(undefined);
  };

  const onGoBackClick = () => {
    logButtonClick('add_reading_back_to_calendar');
    setSelectedDate(null);
  };

  const onDayClick = (day: number, dateString: string) => {
    logValueChange('add_reading_day', selectedDate, dateString, {
      day,
    });
    setSelectedDate(dateString);
  };

  const onRangeChange = ({ startVerse, endVerse }) => {
    setRangeStart(startVerse);
    setRangeEnd(endVerse);
  };

  const getIsAddButtonDisabled = () => {
    return !isValidVerseRange(chaptersData, {
      startVerse: rangeStart,
      endVerse: rangeEnd,
    });
  };

  const currentMonthDisabledDaysSet = useMemo(() => {
    const { month: currentMonth, day: currentDay } = dateToYearMonthDay(new Date());

    const disabledDays = new Set();

    // if the current month is the selected month
    if (selectedMonth === currentMonth) {
      const daysInMonth = getMonthDateObject(selectedYear, currentMonth).getDate();
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Array.from({ length: daysInMonth }).forEach((_, index) => {
        const dayNumber = index + 1;
        // if the day of the loop exceeds the current day, disable it
        if (dayNumber > currentDay) {
          // YYYY-MM-DD
          disabledDays.add(
            dateToDateString({ day: dayNumber, month: currentMonth, year: selectedYear }),
          );
        }
      });
    }

    return disabledDays;
  }, [selectedMonth, selectedYear]);

  /**
   * Check if a day is disabled. A day is disabled if it's later than today.
   *
   * @param {number} day
   * @param {string} dateString
   * @returns {boolean}
   */
  const getIsDayDisabled = (day: number, dateString: string): boolean => {
    const currentMonth = getCurrentMonth();
    // if the selected month is before the current month, don't disable any day
    if (selectedMonth < currentMonth) {
      return false;
    }
    // if the selected month is after the current month, disable all of the days
    if (selectedMonth > currentMonth) {
      return true;
    }
    // for the current month, we need to check which days are later than today and disable them
    return currentMonthDisabledDaysSet.has(dateString);
  };

  const onSubmitClick = () => {
    const payload = {
      ranges,
      seconds: totalSeconds,
      date: selectedDate,
      type: ActivityDayType.QURAN,
      mushafId: mushaf,
    };
    logFormSubmission('add_reading', payload);
    setIsSubmitting(true);
    updateActivityDay(payload)
      .then(() => {
        // invalidate the current month's history cache to refetch the data if we navigated to it
        const currentMonthHistoryUrl = makeFilterActivityDaysUrl(
          getFilterActivityDaysParamsOfCurrentMonth(),
        );
        cache.delete(currentMonthHistoryUrl);
        mutate(makeStreakUrl());
        // close the modal
        onClose();
        toast(t('add-data-success'), {
          status: ToastStatus.Success,
        });
      })
      .catch(() => {
        toast(t('common:error.general'), {
          status: ToastStatus.Error,
        });
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <>
      <Button onClick={onOpenClick} variant={ButtonVariant.Outlined}>
        {t('manually-add')}
      </Button>
      <Modal
        isOpen={isOpen}
        onClickOutside={onClose}
        onEscapeKeyDown={onClose}
        size={ModalSize.LARGE}
      >
        <Modal.Body>
          <Modal.Header>
            <Modal.Title>
              {selectedDate ? (
                <div className={styles.selectedDateHeaderContainer}>
                  <Button
                    size={ButtonSize.Medium}
                    variant={ButtonVariant.Ghost}
                    onClick={onGoBackClick}
                    className={styles.backButton}
                  >
                    <ArrowLeft />
                  </Button>
                  <p>
                    {t('history-for', {
                      date: dateToReadableFormat(selectedDate, lang, {
                        year: 'numeric',
                      }),
                    })}
                  </p>
                </div>
              ) : (
                <p>{t('manually-add')}</p>
              )}
            </Modal.Title>
          </Modal.Header>
          {!selectedDate ? (
            <>
              <div className={styles.calendarMonthSelector}>
                <Button
                  variant={ButtonVariant.Ghost}
                  shape={ButtonShape.Circle}
                  onClick={onMonthBackClick}
                  isDisabled={selectedMonth === 1}
                >
                  <ChevronLeft />
                </Button>
                <p className={styles.monthName}>{selectedMonthObj.name}</p>
                <Button
                  variant={ButtonVariant.Ghost}
                  shape={ButtonShape.Circle}
                  onClick={onMonthForwardClick}
                  isDisabled={selectedMonth === 12}
                >
                  <ChevronRight />
                </Button>
              </div>
              <Calendar
                month={selectedMonthObj?.id as any}
                year={selectedYear}
                onDayClick={onDayClick}
                getIsDayDisabled={getIsDayDisabled}
              />
            </>
          ) : (
            <>
              <VerseRangeInput
                rangeStartVerse={rangeStart}
                rangeEndVerse={rangeEnd}
                onRangeChange={onRangeChange}
              />
              <Button isDisabled={getIsAddButtonDisabled()} onClick={onAddClick}>
                {t('add')}
              </Button>

              <div className={styles.durationInputWrapper}>
                <DurationInput
                  totalSeconds={totalSeconds}
                  onTotalSecondsChange={setTotalSeconds}
                  disabled={isValidating}
                  label={t('reading-time')}
                />
              </div>

              <div className={styles.verseRangesListContainer}>
                <VerseRangesList ranges={ranges} allowClearingRanges setRanges={setRanges} />
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Modal.CloseAction isDisabled={isSubmitting} onClick={onClose}>
            {t('common:cancel')}
          </Modal.CloseAction>
          <Modal.Action
            isPrimary
            isDisabled={!ranges.length || isSubmitting}
            onClick={onSubmitClick}
          >
            {isSubmitting ? <Spinner /> : t('common:submit')}
          </Modal.Action>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AddReading;
