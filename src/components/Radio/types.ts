export type AudioTrack = {
  reciterId: string;
  surah: string;
};

export enum StationType {
  Curated = 'curated',
  Reciter = 'reciter',
}

export type StationState = {
  type: StationType;
  id: string;
  reciterId: string;
  chapterId: string;
};

export type StationOperator = {
  getNextAudioTrack: (stationState: StationState) => AudioTrack;
};

export type CuratedStation = {
  audioTracks: AudioTrack[];
  title: string;
  description: string;
  bannerImgSrc?: string;
};

export type StationInfo = {
  title: string;
  description: string;
};
