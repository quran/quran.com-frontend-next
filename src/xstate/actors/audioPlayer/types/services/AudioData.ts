import Segment from 'types/Segment';

/* eslint-disable @typescript-eslint/naming-convention */
export type AudioFile = {
  id: number;
  chapter_id: number;
  file_size: number;
  format: string;
  audio_url: string;
  duration: number;
  verse_timings: {
    verse_key: string;
    timestamp_from: number;
    timestamp_to: number;
    duration: number;
    segments: Segment[];
  }[];
};

type AudioData = {
  audio_files: AudioFile[];
};

export default AudioData;
