import useTranslation from 'next-translate/useTranslation';
import useSWRImmutable from 'swr/immutable';

import RadioContext from '../actors/radio/types/RadioContext';

import curatedStations from '@/components/Radio/curatedStations';
import { StationInfo, StationType } from '@/components/Radio/types';
import { makeReciterUrl } from '@/utils/apiPaths';
import { getReciterData } from 'src/api';

const useCurrentStationInfo = (context: RadioContext): StationInfo => {
  const { t, lang } = useTranslation('radio');

  const stationState = context;

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
