export type AudioItem = {
  reciterId: string;
  chapterId: string;
};

export enum StationType {
  Curated = 'curated',
  Reciter = 'reciter',
}

export type StationState = {
  type: StationType;
  id: string;
  title: string;
  description: string;
  reciterId: string;
  chapterId: string;
};

export type StationOperator = {
  getNextAudio: (stationState: StationState) => AudioItem;
};

export type CuratedStation = {
  audioItems: AudioItem[];
  title: string;
  description: string;
};
