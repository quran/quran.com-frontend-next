import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';
import useSWR from 'swr';

import styles from './PrayerTimes.module.scss';

import { fetcher } from 'src/api';
import { selectCalculationMethod, selectMadhab } from 'src/redux/slices/prayerTimes';
import { makePrayerTimesUrl } from 'src/utils/apiPaths';

const PrayerTimes = () => {
  const { t } = useTranslation('home');

  const calculationMethod = useSelector(selectCalculationMethod);
  const madhab = useSelector(selectMadhab);
  const { data } = useSWR<Data>(makePrayerTimesUrl({ calculationMethod, madhab }), fetcher);

  if (!data) return null;

  const { prayerTimes } = data;
  const nextPrayerTime = prayerTimes ? getNextPrayerTime(prayerTimes) : null;

  return (
    <div className={styles.container}>
      <div>{formatHijriDate(data.hijriDate)}</div>
      <div className={styles.prayerTimesContainer}>
        <div>{formatLocation(data.geo)}</div>
        {nextPrayerTime && (
          <div>
            <span className={styles.prayerName}>
              {t(`prayerNames.${nextPrayerTime.prayerName}`)}
            </span>{' '}
            <span>
              {formatTime(nextPrayerTime.time.getHours())}:
              {formatTime(nextPrayerTime.time.getMinutes())}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

type PrayerTimes = {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
};

type Geo = {
  city?: string;
  country?: string;
  region?: string;
  latitude?: string;
  longitude?: string;
};

type Data = {
  geo: Geo;
  prayerTimes: PrayerTimes;
  hijriDate: string;
};

const formatHijriDate = (hijriDate: string) => {
  return hijriDate.split(',').slice(1).join(',').trim();
};

const formatTime = (time: number) => time.toString().padStart(2, '0');
const formatLocation = (geo: Geo) => {
  const location = [];
  if (geo.city) {
    location.push(geo.city);
  }
  if (geo.country) {
    location.push(geo.country);
  }

  return location.join(', ');
};

const getNextPrayerTime = (
  prayerTimes: PrayerTimes,
): {
  prayerName: string;
  time: Date;
} => {
  const now = new Date();

  const prayerTimeEntries = Object.entries(prayerTimes).sort((a, b) => {
    const timeA = new Date(a[1]);
    const timeB = new Date(b[1]);
    return timeA.getTime() - timeB.getTime();
  });

  let nextPrayerTime = prayerTimeEntries.find((prayerTime) => {
    const [, time] = prayerTime;
    const date = new Date(time);
    return now < date;
  });

  // if nextPrayerTime is not found for this day, this means isha is done. So we use fajr as nextPrayerTime
  if (!nextPrayerTime) nextPrayerTime = prayerTimeEntries[0];

  const [prayerName, time] = nextPrayerTime;
  return {
    prayerName,
    time: new Date(time),
  };
};

export default PrayerTimes;
