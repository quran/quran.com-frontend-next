import useSWR from 'swr';

import styles from './PrayerTimes.module.scss';

import { fetcher } from 'src/api';

// TODO: replace this url
const URL = 'https://quran-prayer-times-api-abdellatif-io-qurancom.vercel.app/api/prayer-times';

const PrayerTimes = () => {
  const { data } = useSWR<Data>(URL, (url) => fetcher(url));

  if (!data) return null;

  const { prayerTimes } = data;
  const nextPrayerTimes = getNextPrayerTimes(prayerTimes);

  return (
    <div className={styles.container}>
      <div>{getFormattedHijriDate()}</div>
      <div className={styles.prayerTimesContainer}>
        <div>
          {data.geo.city}, {data.geo.country}
        </div>
        <div>
          <span className={styles.prayerName}>{nextPrayerTimes.prayerName}</span>{' '}
          <span>
            {nextPrayerTimes.time.getHours()}:{nextPrayerTimes.time.getMinutes()}
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
};

const getFormattedHijriDate = () => {
  return new Intl.DateTimeFormat('en-TN-u-ca-islamic', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
    year: 'numeric',
  })
    .format(Date.now())
    .split(',')
    .slice(1)
    .join(',')
    .trim();
};

const getNextPrayerTimes = (
  prayerTimes: PrayerTimes,
): {
  prayerName: string;
  time: Date;
} => {
  const now = new Date();

  const nextPrayerTimes = Object.entries(prayerTimes).find((prayerTime) => {
    const [, time] = prayerTime;
    const date = new Date(time);
    return now < date;
  });

  if (!nextPrayerTimes) return null;

  const [prayerName, time] = nextPrayerTimes;
  return {
    prayerName,
    time: new Date(time),
  };
};

export default PrayerTimes;
