/* eslint-disable max-lines */
import { useMemo, useState, useEffect, useCallback } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';
import useSWRImmutable from 'swr/immutable';

import styles from './AddReading.module.scss';
import AddReadingForm from './AddReadingForm';

import buildTranslatedErrorMessageByErrorId from '@/components/FormBuilder/buildTranslatedErrorMessageByErrorId';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import Calendar from '@/dls/Calendar';
import { ModalSize } from '@/dls/Modal/Content';
import Modal from '@/dls/Modal/Modal';
import Spinner from '@/dls/Spinner/Spinner';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useGetMushaf from '@/hooks/useGetMushaf';
import ChevronLeft from '@/icons/chevron-left.svg';
import ChevronRight from '@/icons/chevron-right.svg';
import ArrowLeft from '@/icons/west.svg';
import { ActivityDayType } from '@/types/auth/ActivityDay';
import ErrorMessageId from '@/types/ErrorMessageId';
import { getFilterActivityDaysParamsOfCurrentMonth } from '@/utils/activity-day';
import { estimateRangesReadingTime, updateActivityDay } from '@/utils/auth/api';
import {
  makeEstimateRangesReadingTimeUrl,
  makeFilterActivityDaysUrl,
  makeStreakUrl,
} from '@/utils/auth/apiPaths';
import {
  dateToReadableFormat,
  getCurrentDay,
  getCurrentMonth,
  getMonthsInYear,
} from '@/utils/datetime';
import { logValueChange, logButtonClick, logFormSubmission } from '@/utils/eventLogger';

const AddReading = () => {
  const { t, lang } = useTranslation('reading-progress');
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState<number>(() => getCurrentMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const selectedYear = useMemo(() => new Date().getFullYear(), []);

  const [ranges, setRanges] = useState<string[]>([]);
  const [totalSeconds, setTotalSeconds] = useState<number>(0);
  const [totalSecondsError, setTotalSecondsError] = useState<string | null>(null);

  const months = useMemo(() => getMonthsInYear(selectedYear, lang), [selectedYear, lang]);
  const mushaf = useGetMushaf();
  const toast = useToast();
  const { cache, mutate } = useSWRConfig();

  const { isValidating, data } = useSWRImmutable(
    ranges.length > 0 ? makeEstimateRangesReadingTimeUrl({ ranges }) : null,
    () => estimateRangesReadingTime({ ranges }),
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
    // reset seconds error
    setTotalSecondsError(null);
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

  const onTotalSecondsChange = useCallback(
    (newTotalSeconds: number) => {
      setTotalSeconds(newTotalSeconds);
      if (totalSecondsError && newTotalSeconds > 0) {
        setTotalSecondsError(null);
      }
    },
    [totalSecondsError],
  );

  /**
   * Check if a day is disabled. A day is disabled if it's later than today.
   *
   * @param {number} day
   * @returns {boolean}
   */
  const getIsDayDisabled = (day: number): boolean => {
    const currentMonth = getCurrentMonth();
    // if the selected month is before the current month, don't disable any day
    if (selectedMonth < currentMonth) {
      return false;
    }
    // if the selected month is after the current month, disable all of the days
    if (selectedMonth > currentMonth) {
      return true;
    }

    const currentDay = getCurrentDay();

    // for the current month, we need to check which days are later than today and disable them
    if (day > currentDay) {
      return true;
    }

    return false;
  };

  // eslint-disable-next-line react-func/max-lines-per-function
  const onSubmitClick = async () => {
    if (totalSeconds < 1) {
      setTotalSecondsError(
        buildTranslatedErrorMessageByErrorId(ErrorMessageId.RequiredField, t('reading-time'), t),
      );
      return;
    }

    const payload = {
      ranges,
      seconds: totalSeconds,
      date: selectedDate,
      type: ActivityDayType.QURAN,
      mushafId: mushaf,
    };
    logFormSubmission('add_reading', payload);
    setIsSubmitting(true);

    try {
      await updateActivityDay(payload);
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
    } catch (e) {
      toast(t('common:error.general'), {
        status: ToastStatus.Error,
      });
    } finally {
      setIsSubmitting(false);
    }
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
            <AddReadingForm
              ranges={ranges}
              setRanges={setRanges}
              totalSeconds={totalSeconds}
              setTotalSeconds={onTotalSecondsChange}
              isFetchingSeconds={isValidating}
              totalSecondsError={totalSecondsError}
            />
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
