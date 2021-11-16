import { useEffect } from 'react';

import { useDispatch } from 'react-redux';

import { LocationAccess, setLocationAccess } from 'src/redux/slices/prayerTimes';

const GeoLocationPermissionListener = () => {
  const dispatch = useDispatch();

  const dispatchSetLocationAccess = (permissionState: string) => {
    if (permissionState === 'granted') dispatch(setLocationAccess(LocationAccess.On));
    else dispatch(setLocationAccess(LocationAccess.Off));
  };

  useEffect(() => {
    navigator?.permissions?.query({ name: 'geolocation' }).then((permissionStatus) => {
      // eslint-disable-next-line no-param-reassign
      permissionStatus.onchange = (event: any) => {
        dispatchSetLocationAccess(event?.target?.state);
      };
    });
  });
  return null;
};

export default GeoLocationPermissionListener;
