import { useRef, useEffect } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import useSWR from 'swr';

import FindLocationIcon from '../../../../public/icons/find-location.svg';
import { ToastContainer } from '../../dls/Toast/Toast';

import styles from './PrayerTimes.module.scss';
import { formatLocation, getNextPrayerTime } from './PrayerTimesHelper';
import { PrayerTimesData } from './PrayerTimesTypes';

import { fetcher } from 'src/api';
import Button, { ButtonType, ButtonVariant } from 'src/components/dls/Button/Button';
// import Skeleton from 'src/components/dls/Skeleton/Skeleton';
import {
  LocationAccess,
  selectCalculationMethod,
  selectLocationAccess,
  selectMadhab,
  setLocationAccess,
} from 'src/redux/slices/prayerTimes';
import { makePrayerTimesUrl } from 'src/utils/apiPaths';
import { logButtonClick } from 'src/utils/eventLogger';
import { toLocalizedDate } from 'src/utils/locale';

const getCoordinates = (): Promise<{
  latitude: number;
  longitude: number;
}> => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (err) => reject(err),
    );
  });
};

const usePrayerTimesData = () => {
  const calculationMethod = useSelector(selectCalculationMethod);
  const locationAccess = useSelector(selectLocationAccess);
  const madhab = useSelector(selectMadhab);

  const { data } = useSWR<PrayerTimesData>(
    [makePrayerTimesUrl({ calculationMethod, madhab }), locationAccess],
    async (url, withLocationAccess) => {
      if (withLocationAccess === LocationAccess.On) {
        const coordinates = await getCoordinates().catch(() => {
          return {}; // fallback: return empty object if browser fail to get coordinates
        });
        return fetcher(makePrayerTimesUrl({ calculationMethod, madhab, ...coordinates }));
      }

      return fetcher(makePrayerTimesUrl({ calculationMethod, madhab }));
    },
  );

  // Keep previous data point to avoid UI glitch https://swr.vercel.app/docs/middleware#keep-previous-result
  const laggyDataRef = useRef<PrayerTimesData>();
  useEffect(() => {
    if (data !== undefined) {
      laggyDataRef.current = data;
    }
  }, [data]);

  return laggyDataRef.current || data;
};

const PrayerTimes = () => {
  const { t, lang } = useTranslation('');
  const dispatch = useDispatch();
  const prayerTimesData = usePrayerTimesData();

  const hijriDate = useHijriDateFormatter();

  if (!prayerTimesData) return null;

  // TODO: update skeleton style and bring it in prayer times's loading state
  // return (
  //   <div className={styles.container}>
  //     <div>
  //       <Skeleton>
  //         <div className={styles.hijriDatePlaceholder} />
  //       </Skeleton>
  //     </div>
  //     <div>
  //       <Skeleton>
  //         <div className={styles.prayerTimesPlaceholder} />
  //       </Skeleton>
  //     </div>
  //   </div>
  // );

  const { prayerTimes } = prayerTimesData;
  const nextPrayerTime = prayerTimes ? getNextPrayerTime(prayerTimes) : null;

  /**
   * - If permission query API is supported in current browser
   *    - if permission is granted or not asked yet. Get the location data
   *    - if permission is denied. Do not try to get the location data
   * - if the browser does not support the API. Optimistically get the location data. (This is better for UX)
   */
  const onFindLocationClick = () => {
    logButtonClick('use_location');
    const permissionQuerySupported = navigator?.permissions?.query;
    if (permissionQuerySupported)
      navigator?.permissions?.query({ name: 'geolocation' }).then((permissionStatus) => {
        if (permissionStatus.state === 'granted' || permissionStatus.state === 'prompt') {
          dispatch(setLocationAccess(LocationAccess.On));
          toast(t('common:prayer-times.location-updated'));
        } else {
          dispatch(setLocationAccess(LocationAccess.Off));
          toast(t('common:prayer-times.access-denied'));
        }
      });
    else {
      dispatch(setLocationAccess(LocationAccess.On));
      toast(t('common:prayer-times.location-updated'));
    }
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.hijriDate}>{hijriDate}</div>
        <div className={styles.prayerTimesContainer}>
          <div className={styles.locationContainer}>
            <Button
              tooltip={t('home:prayer-times.use-location')}
              onClick={onFindLocationClick}
              type={ButtonType.Secondary}
              className={styles.findLocationButton}
              variant={ButtonVariant.Ghost}
            >
              <FindLocationIcon />
            </Button>
            <span>{formatLocation(prayerTimesData.geo)}</span>
          </div>
          {nextPrayerTime && (
            <div>
              <span className={styles.prayerName}>
                {t(`home:prayer-names.${nextPrayerTime.prayerName}`)}
              </span>{' '}
              <span>{toLocalizedDate(nextPrayerTime.time, lang, { timeStyle: 'short' })}</span>
            </div>
          )}
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

const useHijriDateFormatter = () => {
  const { lang } = useTranslation('home');
  return toLocalizedDate(new Date(), lang, { calendar: 'islamic', dateStyle: 'long' });
};

export default PrayerTimes;
