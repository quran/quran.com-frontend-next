import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import useSWRImmutable from 'swr/immutable';

import styles from './QuranicCalendarWeek.module.scss';

import ReflectionText from '@/components/QuranReflect/ReflectionText';
import Collapsible, { CollapsibleDirection } from '@/dls/Collapsible/Collapsible';
import Link, { LinkVariant } from '@/dls/Link/Link';
import ChevronDownIcon from '@/icons/chevron-down.svg';
import { getQuranicCalendarPostOfWeek } from '@/utils/auth/qf/api';
import { makeQuranicCalendarPostOfWeekUrl } from '@/utils/auth/qf/apiPaths';
import { dateToReadableFormat } from '@/utils/datetime';
import { logButtonClick } from '@/utils/eventLogger';
import { getSurahNavigationUrl } from '@/utils/navigation';

type Props = {
  weekNumber: number;
  monthOrder: number;
  isCurrentWeek: boolean;
  localizedMonthAndYear: string;
  ranges: string;
  firstDayOfWeek: {
    day: number;
    month: number;
    year: number;
  };
};

// Abdelhaleem
const TRANSLATION_ID = 85;

const QuranicCalendarWeek: React.FC<Props> = ({
  weekNumber,
  localizedMonthAndYear,
  isCurrentWeek,
  monthOrder,
  ranges,
  firstDayOfWeek,
}) => {
  const { t, lang } = useTranslation('quranic-calendar');
  const { day, month, year } = firstDayOfWeek;
  const firstDayOfWeekDate = new Date(year, month - 1, day);

  const onClick = () => {
    logButtonClick('quranic_calendar_week', {
      ranges,
    });
  };

  const URL = `${ranges}?translations=${TRANSLATION_ID}&hideArabic=true`;
  const weekOrder = monthOrder + weekNumber;

  const { data, isValidating, error } = useSWRImmutable(
    makeQuranicCalendarPostOfWeekUrl(weekOrder),
    async () => {
      const response = await getQuranicCalendarPostOfWeek(weekOrder);
      return response;
    },
  );
  const postBody = !isValidating && !error && data?.post;

  return (
    <div
      className={classNames(styles.weekContainer, {
        [styles.currentWeek]: isCurrentWeek,
      })}
    >
      <p>
        {`${t('week-title', {
          weekNumber: weekOrder,
          monthAndYear: localizedMonthAndYear,
        })} - ${dateToReadableFormat(firstDayOfWeekDate, lang, {
          timeZone: undefined,
        })}`}
      </p>
      <Link
        isNewTab
        onClick={onClick}
        variant={LinkVariant.Blend}
        href={getSurahNavigationUrl(URL)}
      >
        {ranges}
      </Link>
      {!!postBody && (
        <Collapsible
          direction={CollapsibleDirection.Right}
          title={<div className={styles.collapsibleTitle}>{t('supplemental-resources')}</div>}
          prefix={<ChevronDownIcon />}
          shouldRotatePrefixOnToggle
        >
          {({ isOpen: isCollapsibleOpen }) => {
            if (!isCollapsibleOpen) return null;
            return (
              <div className={styles.collapsibleBody}>
                <ReflectionText reflectionText={postBody} />
              </div>
            );
          }}
        </Collapsible>
      )}
    </div>
  );
};

export default QuranicCalendarWeek;
