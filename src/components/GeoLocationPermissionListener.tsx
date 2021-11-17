import { useEffect } from 'react';

import { useDispatch } from 'react-redux';

import { LocationAccess, setLocationAccess } from 'src/redux/slices/prayerTimes';

const GeoLocationPermissionListener = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    navigator?.permissions?.query({ name: 'geolocation' }).then((permissionStatus) => {
      // eslint-disable-next-line no-param-reassign
      permissionStatus.onchange = (event: any) => {
        const isLocationAccessGranted = event?.target?.state === 'granted';
        dispatch(
          setLocationAccess(isLocationAccessGranted ? LocationAccess.On : LocationAccess.Off),
        );
      };
    });
  }, [dispatch]);
  return null;
};

export default GeoLocationPermissionListener;
