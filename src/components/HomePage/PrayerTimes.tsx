import { useEffect } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import useSWR from 'swr';

import FindLocationIcon from '../../../public/icons/find-location.svg';
import { ToastContainer } from '../dls/Toast/Toast';
import { setAccurateLocation } from '../Navbar/SettingsDrawer/PrayerTimesSection';

import styles from './PrayerTimes.module.scss';

import { fetcher } from 'src/api';
import Button, { ButtonType, ButtonVariant } from 'src/components/dls/Button/Button';
import {
  GeoPermission,
  selectCalculationMethod,
  selectGeoLocation,
  selectGeoPermission,
  selectMadhab,
} from 'src/redux/slices/prayerTimes';
import { makePrayerTimesUrl } from 'src/utils/apiPaths';

const PrayerTimes = () => {
  const { t } = useTranslation('home');
  const geoLocation = useSelector(selectGeoLocation, shallowEqual);
  const geoPermission = useSelector(selectGeoPermission);
  const dispatch = useDispatch();

  useEffect(() => {
    // get the location every time the user refresh the page if we already have the permission
    if (geoPermission === GeoPermission.Granted) setAccurateLocation(dispatch);
  }, [dispatch, geoPermission]);

  const calculationMethod = useSelector(selectCalculationMethod);
  const madhab = useSelector(selectMadhab);
  const { data } = useSWR<Data>(
    makePrayerTimesUrl({
      calculationMethod,
      madhab,
      ...geoLocation,
    }),
    fetcher,
  );
  const hijriDate = useHijriDateFormatter(data?.hijriDateData);

  if (!data) return null;

  const { prayerTimes } = data;
  const nextPrayerTime = prayerTimes ? getNextPrayerTime(prayerTimes) : null;

  return (
    <>
      <div className={styles.container}>
        <div>{hijriDate}</div>
        <div className={styles.prayerTimesContainer}>
          <div className={styles.locationContainer}>
            <Button
              onClick={() => setAccurateLocation(dispatch)}
              type={ButtonType.Secondary}
              className={styles.findLocationButton}
              variant={ButtonVariant.Ghost}
            >
              <FindLocationIcon />
            </Button>
            <span>{formatLocation(data.geo)}</span>
          </div>
          {nextPrayerTime && (
            <div>
              <span className={styles.prayerName}>
                {t(`prayer-names.${nextPrayerTime.prayerName}`)}
              </span>{' '}
              <span>
                {formatTime(nextPrayerTime.time.getHours())}:
                {formatTime(nextPrayerTime.time.getMinutes())}
              </span>
            </div>
          )}
        </div>
      </div>
      <ToastContainer />
    </>
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

type HijriDateData = {
  dayName: string;
  month: number;
  date: number;
  year: number;
};

type Data = {
  geo: Geo;
  prayerTimes: PrayerTimes;
  hijriDate: string;
  hijriDateData: HijriDateData;
};

const useHijriDateFormatter = (hijriDate?: HijriDateData) => {
  const { t } = useTranslation('home');
  if (!hijriDate) return null;

  const month = t(`hijri-date.month.${hijriDate.month}`);

  // Different language have different format to show the date, so we need to "format" it.
  // For example in Indonesia we say "12 Muharram 1443" instead of "Muharram 12, 1443"
  return t('hijri-date.format', {
    date: hijriDate.date,
    month,
    year: hijriDate.year,
  });
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
