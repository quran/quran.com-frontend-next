import { useEffect } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import useSWR from 'swr';

import FindLocationIcon from '../../../../public/icons/find-location.svg';
import { ToastContainer } from '../../dls/Toast/Toast';
import { setAccurateLocation } from '../../Navbar/SettingsDrawer/PrayerTimesSection';

import styles from './PrayerTimes.module.scss';
import { formatLocation, formatTime, getNextPrayerTime } from './PrayerTimesHelper';
import { PrayerTimesData, HijriDateData } from './PrayerTimesTypes';

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
  const { t } = useTranslation('');
  const geoLocation = useSelector(selectGeoLocation, shallowEqual);
  const geoPermission = useSelector(selectGeoPermission);
  const dispatch = useDispatch();

  useEffect(() => {
    // get the location every time the user refresh the page if we already have the permission
    if (geoPermission === GeoPermission.Granted) setAccurateLocation(dispatch);
  }, [dispatch, geoPermission, t]);

  const calculationMethod = useSelector(selectCalculationMethod);
  const madhab = useSelector(selectMadhab);
  const { data } = useSWR<PrayerTimesData>(
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
              onClick={() =>
                setAccurateLocation(dispatch, () =>
                  toast(t('common:prayer-times.location-updated')),
                )
              }
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
                {t(`home:prayer-names.${nextPrayerTime.prayerName}`)}
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

export default PrayerTimes;
