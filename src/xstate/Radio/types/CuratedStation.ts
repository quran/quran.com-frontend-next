import AudioTrack from './AudioTrack';

type CuratedStation = {
  audioTracks: AudioTrack[];
  title: string;
  description: string;
  bannerImgSrc?: string;
};

export default CuratedStation;
