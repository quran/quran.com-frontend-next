import useSWR from 'swr';

import styles from './PrayerTimes.module.scss';

import { fetcher } from 'src/api';

// TODO: replace this url
const URL = 'https://quran-prayer-times-api-abdellatif-io-qurancom.vercel.app/api/prayer-times';

const PrayerTimes = () => {
  const { data } = useSWR<Data>(URL, (url) => fetcher(url));

  if (!data) return null;

  const { prayerTimes } = data;
  const nextPrayerTime = prayerTimes ? getNextPrayerTime(prayerTimes) : null;

  return (
    <div className={styles.container}>
      <div>{formatHijriDate(data.hijriDate)}</div>
      <div className={styles.prayerTimesContainer}>
        <div>
          {data.geo?.city}, {data.geo?.country}
        </div>
        <div>
          <span className={styles.prayerName}>{nextPrayerTime?.prayerName}</span>{' '}
          <span>
            {formatTime(nextPrayerTime?.time?.getHours())}:
            {formatTime(nextPrayerTime?.time?.getMinutes())}
          </span>
        </div>
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

type Data = {
  geo: {
    city: string;
    country: string;
    region: string;
    latitude: string;
    longitude: string;
  };
  prayerTimes: PrayerTimes;
  hijriDate: string;
};

const formatHijriDate = (hijriDate: string) => {
  return hijriDate.split(',').slice(1).join(',').trim();
};

const formatTime = (time: number) => time.toString().padStart(2, '0');

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
  nextPrayerTime = prayerTimeEntries[0];

  const [prayerName, time] = nextPrayerTime;
  return {
    prayerName,
    time: new Date(time),
  };
};

export default PrayerTimes;
