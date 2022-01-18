export type AudioTrack = {
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
  getNextAudio: (stationState: StationState) => AudioTrack;
};

export type CuratedStation = {
  audioTracks: AudioTrack[];
  title: string;
  description: string;
  bannerImgSrc?: string;
};
