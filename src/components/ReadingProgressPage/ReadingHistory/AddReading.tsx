/* eslint-disable max-lines */
import { useMemo, useRef, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './ReadingHistory.module.scss';

import DataFetcher from '@/components/DataFetcher';
import VerseRangesList from '@/components/ReadingGoal/ReadingGoalAmount/VerseRangesList';
import VerseRangeInput from '@/components/ReadingGoal/ReadingGoalInput/VerseRangeInput';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import Calendar from '@/dls/Calendar';
import ContentModal from '@/dls/ContentModal/ContentModal';
import ContentModalHandles from '@/dls/ContentModal/types/ContentModalHandles';
import Select from '@/dls/Forms/Select';
import Spinner from '@/dls/Spinner/Spinner';
import ChevronLeft from '@/icons/chevron-left.svg';
import ChevronRight from '@/icons/chevron-right.svg';
import ArrowLeft from '@/icons/west.svg';
import { ActivityDay } from '@/types/auth/ActivityDay';
import { privateFetcher } from '@/utils/auth/api';
import { makeFilterActivityDaysUrl } from '@/utils/auth/apiPaths';
import { dateToReadableFormat, getMonthsInYear } from '@/utils/datetime';
import { logButtonClick, logValueChange } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';

const AddReading = () => {
  const { t, lang } = useTranslation('reading-progress');
  const contentModalRef = useRef<ContentModalHandles>();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const availableYears = useMemo(() => {
    const startYear = 2023;
    const currentYear = new Date().getFullYear();

    // eslint-disable-next-line @typescript-eslint/naming-convention
    return Array.from({ length: currentYear - (startYear - 1) }, (_, i) => i + startYear).map(
      (year) => ({
        label: toLocalizedNumber(year, lang, undefined, { useGrouping: false }),
        value: year.toString(),
      }),
    );
  }, [lang]);

  const months = useMemo(() => getMonthsInYear(selectedYear, lang), [selectedYear, lang]);

  const onClose = () => {
    setIsOpen(false);
  };

  const onOpen = () => {
    setIsOpen(true);
  };

  const selectedMonthObj = useMemo(() => {
    if (!selectedMonth) return null;
    return months.find((month) => month.id === selectedMonth);
  }, [selectedMonth, months]);

  const onMonthBackClick = () => {
    const newMonth = selectedMonth - 1;
    logValueChange('log_reading_history_year', selectedMonth, newMonth);
    setSelectedMonth(newMonth);
  };

  const onMonthForwardClick = () => {
    const newMonth = selectedMonth + 1;
    logValueChange('log_reading_history_year', selectedMonth, newMonth);
    setSelectedMonth(newMonth);
  };

  const onYearChange = (newValue: string) => {
    const newYear = Number(newValue);
    logValueChange('log_reading_history_year', selectedYear, newYear);

    setSelectedYear(newYear);
  };

  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [rangeEnd, setRangeEnd] = useState<string | null>(null);

  const [ranges, setRanges] = useState<string[]>([]);

  const onAdd = () => {
    if (!rangeStart || !rangeEnd) return;
    const newRanges = [...ranges, `${rangeStart}-${rangeEnd}`];
    setRanges(newRanges);
    setRangeStart(null);
    setRangeEnd(null);
  };

  return (
    <>
      <Button onClick={onOpen} variant={ButtonVariant.Outlined}>
        Add offline readings
      </Button>

      <ContentModal
        isOpen={isOpen}
        innerRef={contentModalRef}
        hasCloseButton
        onClose={onClose}
        onEscapeKeyDown={onClose}
        header={
          <div className={styles.modalHeader}>
            {selectedDate ? (
              <>
                <Button
                  size={ButtonSize.Medium}
                  variant={ButtonVariant.Ghost}
                  onClick={() => setSelectedDate(null)}
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
              </>
            ) : (
              <p>Add offline readings</p>
            )}
          </div>
        }
      >
        {/* <div>
          <label htmlFor="log-readings-month-select">Month</label>
          <Select
            id="log-readings-month-select"
            name="log-readings-month-select"
            options={months.map((month) => ({
              label: month.name,
              value: month.id.toString(),
            }))}
            value={selectedMonth.toString()}
            onChange={onMonthClick}
          />
        </div> */}

        <div className={styles.modalContentContainer}>
          {!selectedDate ? (
            <>
              {/* <div>
                <label htmlFor="log-readings-year-select">Year</label>
                <Select
                  id="log-readings-year-select"
                  name="log-readings-year-select"
                  options={availableYears}
                  value={selectedYear.toString()}
                  onChange={onYearChange}
                />
              </div> */}
              <div className={styles.calendarMonthSelector}>
                <Button
                  variant={ButtonVariant.Ghost}
                  shape={ButtonShape.Circle}
                  onClick={onMonthBackClick}
                  isDisabled={selectedMonth === 1}
                >
                  <ChevronLeft />
                </Button>
                <p>{selectedMonthObj.name}</p>
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
                onDayClick={(date, dateString) => {
                  setSelectedDate(dateString);
                }}
              />
            </>
          ) : (
            <>
              <VerseRangeInput
                rangeStartVerse={rangeStart}
                rangeEndVerse={rangeEnd}
                onRangeChange={({ startVerse, endVerse }) => {
                  setRangeStart(startVerse);
                  setRangeEnd(endVerse);
                }}
              />
              <Button isDisabled={!rangeStart || !rangeEnd} onClick={onAdd}>
                Add
              </Button>

              <div
                style={{
                  marginTop: 40,
                }}
              >
                <VerseRangesList ranges={ranges} />
              </div>
            </>
          )}
          {/* <DataFetcher 
            queryKey={makeFilterActivityDaysUrl(params)}
            loading={() => {
              return (
                <>
                  <Spinner className={styles.calendarSpinner} />
                  <DaysCalendar
                    month={month}
                    year={year}
                    days={[]}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                  />
                </>
              );
            }}
            fetcher={privateFetcher}
            render={(response) => {
              const data = response as { data: ActivityDay[]; pagination: Pagination };
              const isEmpty = data.data.length === 0;

              return (
                <>
                  {isEmpty && (
                    <p className={styles.emptyMessage}>
                      {t('no-reading-history-for', { date: readableDate })}
                    </p>
                  )}

                  <DaysCalendar
                    month={month}
                    year={year}
                    days={data.data}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                  />
                </>
              );
            }}
          /> */}
        </div>
      </ContentModal>
    </>
  );
};

export default AddReading;
