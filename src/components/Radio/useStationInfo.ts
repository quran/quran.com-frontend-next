import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import curatedStations from './curatedStations';
import { StationInfo, StationType } from './types';

import { getReciterData } from 'src/api';
import { selectRadioStation } from 'src/redux/slices/radio';
import { makeReciterUrl } from 'src/utils/apiPaths';

const useCurrentStationInfo = (): StationInfo => {
  const { t, lang } = useTranslation('radio');

  const stationState = useSelector(selectRadioStation);

  const { data: reciterData } = useSWRImmutable(
    stationState.type === StationType.Reciter ? makeReciterUrl(stationState.id, lang) : null,
    () => getReciterData(stationState.id, lang),
  );

  const getCuratedStationInfo = (): StationInfo => {
    const curatedStation = curatedStations[stationState.id];
    return {
      title: t(`curated-station.${curatedStation.title}`),
      description: t(`curated-station.${curatedStation.description}`),
    };
  };

  const getReciterStationInfo = (): StationInfo => {
    const selectedReciter = reciterData?.reciter;
    return {
      title: selectedReciter?.translatedName?.name,
      description: selectedReciter?.style?.name,
    };
  };

  if (stationState.type === StationType.Curated) return getCuratedStationInfo();
  return getReciterStationInfo();
};

export default useCurrentStationInfo;
