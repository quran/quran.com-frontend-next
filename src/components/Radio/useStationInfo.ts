import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import curatedStations from './curatedStations';
import { StationInfo, StationType } from './types';

import { getAvailableReciters } from 'src/api';
import { selectRadioStation } from 'src/redux/slices/radio';
import { makeRecitersUrl } from 'src/utils/apiPaths';

const useCurrentStationInfo = (): StationInfo => {
  const { t } = useTranslation('radio');

  const stationState = useSelector(selectRadioStation);
  // TODO: once the backend API to fetch 1 reciter is ready, use that API
  // instead of fetching all reciters with `getAvailableReciters`
  const { data: recitersData } = useSWRImmutable(
    stationState.type === StationType.Reciter ? makeRecitersUrl() : null,
    getAvailableReciters,
  );

  const getCuratedStationInfo = (): StationInfo => {
    const curatedStation = curatedStations[stationState.id];
    return {
      title: t(`curated-station.${curatedStation.title}`),
      description: t(`curated-station.${curatedStation.description}`),
    };
  };

  const getReciterStationInfo = (): StationInfo => {
    const selectedReciter = recitersData?.reciters.find(
      (reciter) => reciter.id === Number(stationState.id),
    );
    return {
      title: selectedReciter?.name,
      description: selectedReciter?.style?.name,
    };
  };

  if (stationState.type === StationType.Curated) return getCuratedStationInfo();
  return getReciterStationInfo();
};

export default useCurrentStationInfo;
