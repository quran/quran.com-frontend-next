/* eslint-disable max-lines */
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
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedNumber, toLocalizedVerseKey } from '@/utils/locale';
import {
  QuranicCalendarRangesNavigationSettings,
  getQuranicCalendarRangesNavigationUrl,
} from '@/utils/navigation';
import { getQuranReflectPostUrl } from '@/utils/quranReflect/navigation';

type Props = {
  weekNumber: number;
  isCurrentWeek: boolean;
  localizedMonth: string;
  ranges: string;
};

const QuranicCalendarWeek: React.FC<Props> = ({
  weekNumber,
  localizedMonth,
  isCurrentWeek,
  ranges,
}) => {
  const { t, lang } = useTranslation('quranic-calendar');

  const onRangesClicked = (settings: QuranicCalendarRangesNavigationSettings) => {
    logButtonClick('quranic_calendar_week', {
      ranges,
      weekNumber,
      settings,
    });
  };

  const onInteractClicked = () => {
    logButtonClick('quranic_calendar_interact', {
      ranges,
      weekNumber,
    });
  };

  const { data, isValidating, error } = useSWRImmutable(
    makeQuranicCalendarPostOfWeekUrl(weekNumber),
    async () => {
      const response = await getQuranicCalendarPostOfWeek(weekNumber);
      return response;
    },
  );
  const hasPost = !isValidating && !error && !!data?.post?.body;

  return (
    <div
      className={classNames(styles.weekContainer, {
        [styles.currentWeek]: isCurrentWeek,
      })}
    >
      <p>
        {t('week-title', {
          weekNumber: toLocalizedNumber(weekNumber, lang),
          month: localizedMonth,
          rangeStart: toLocalizedVerseKey(ranges.split('-')[0], lang),
          rangeEnd: toLocalizedVerseKey(ranges.split('-')[1], lang),
        })}
      </p>
      <div>
        <Link
          className={styles.link}
          isNewTab
          onClick={() => {
            onRangesClicked(QuranicCalendarRangesNavigationSettings.EnglishAndArabic);
          }}
          variant={LinkVariant.Blend}
          href={getQuranicCalendarRangesNavigationUrl(
            ranges,
            QuranicCalendarRangesNavigationSettings.EnglishAndArabic,
          )}
        >
          {t('reading-options.en-and-ar')}
        </Link>
        <Link
          isNewTab
          className={styles.link}
          onClick={() => {
            onRangesClicked(QuranicCalendarRangesNavigationSettings.EnglishOnly);
          }}
          variant={LinkVariant.Blend}
          href={getQuranicCalendarRangesNavigationUrl(
            ranges,
            QuranicCalendarRangesNavigationSettings.EnglishOnly,
          )}
        >
          {t('reading-options.en-only')}
        </Link>
        <Link
          isNewTab
          className={styles.link}
          onClick={() => {
            onRangesClicked(QuranicCalendarRangesNavigationSettings.DefaultSettings);
          }}
          variant={LinkVariant.Blend}
          href={getQuranicCalendarRangesNavigationUrl(
            ranges,
            QuranicCalendarRangesNavigationSettings.DefaultSettings,
          )}
        >
          {t('reading-options.default-settings')}
        </Link>
      </div>
      {!!hasPost && (
        <Collapsible
          direction={CollapsibleDirection.Right}
          title={<div className={styles.collapsibleTitle}>{t('supplemental-resources')}</div>}
          prefix={<ChevronDownIcon />}
          shouldRotatePrefixOnToggle
          shouldOpen={isCurrentWeek}
        >
          {({ isOpen: isCollapsibleOpen }) => {
            if (!isCollapsibleOpen) return null;
            return (
              <>
                <div className={styles.collapsibleBody}>
                  <ReflectionText reflectionText={data?.post?.body} />
                </div>
                <Link
                  isNewTab
                  onClick={onInteractClicked}
                  variant={LinkVariant.Blend}
                  href={getQuranReflectPostUrl(data.post.id)}
                >
                  {t('interact-with-post')}
                </Link>
              </>
            );
          }}
        </Collapsible>
      )}
    </div>
  );
};

export default QuranicCalendarWeek;
