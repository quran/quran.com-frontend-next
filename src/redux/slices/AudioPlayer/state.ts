import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getAudioFile, getVerseTimestamps } from 'src/api';
import { triggerPlayAudio, triggerSetCurrentTime } from 'src/components/AudioPlayer/EventTriggers';
import { AudioFile } from 'types/AudioFile';
import Reciter from 'types/Reciter';

const DEFAULT_RECITER = {
  id: 5,
  name: 'Mishari Rashid al-`Afasy',
  recitationStyle: 'Warsh',
  relativePath: 'mishaari_raashid_al_3afaasee',
};

enum AudioFileStatus {
  Loaded = 'Loaded',
  Loading = 'Loading',
  Empty = 'Empty',
}

export type AudioState = {
  isPlaying: boolean;
  currentTime: number;
  reciter: Reciter;
  audioFile: AudioFile;
  audioFileStatus: AudioFileStatus;
};

const initialState: AudioState = {
  isPlaying: false,
  currentTime: 0,
  audioFile: null,
  reciter: DEFAULT_RECITER,
  audioFileStatus: AudioFileStatus.Empty,
};

export const selectAudioPlayerState = (state) => state.audioPlayerState;
export const selectReciter = (state) => state.audioPlayerState.reciter;
export const selectAudioFile = (state) => state.audioPlayerState.audioFile;
export const selectAudioFileStatus = (state) => state.audioPlayerState.audioFileStatus;

/**
 * get the audio file for the current reciter
 * set the value to redux state
 * and play the audio file
 *
 * @param {number} chapter the chapter id
 *
 */
export const loadAndPlayAudioFile = createAsyncThunk<void, number>(
  'audioPlayerState/loadAndPlayAudioFile',
  async (chapter, thunkAPI) => {
    const reciter = selectReciter(thunkAPI.getState());

    const res = await getAudioFile(reciter.id, chapter);
    if (res.status === 500) {
      throw new Error('server error: fail to get audio file');
    }
    const firstAudio = res.audioFiles[0];
    if (!firstAudio) {
      throw new Error('No audio file found');
    }

    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    thunkAPI.dispatch(setAudioFile(firstAudio));
    triggerPlayAudio();
  },
);

/**
 * get the audio file for the current reciter
 * and set the value to redux state
 *
 * @param {number} chapter the chapter id
 *
 */

export const playVerse = createAsyncThunk<void, string>(
  'audioPlayerState/setAudioTime',
  async (verseKey, thunkApi) => {
    const reciter = selectReciter(thunkApi.getState());
    const timeStamp = await getVerseTimestamps(reciter?.id, verseKey);
    const timeStampInSecond = timeStamp.result.timestampFrom / 1000;
    triggerSetCurrentTime(timeStampInSecond);
  },
);

export const audioPlayerStateSlice = createSlice({
  name: 'audioPlayerState',
  initialState,
  reducers: {
    setIsPlaying: (state: AudioState, action: PayloadAction<boolean>) => ({
      ...state,
      isPlaying: action.payload,
    }),
    setReciter: (state, action: PayloadAction<Reciter>) => ({
      ...state,
      reciter: action.payload,
    }),
    setCurrentTime: (state: AudioState, action: PayloadAction<number>) => ({
      ...state,
      currentTime: action.payload,
    }),
    setAudioFile: (state: AudioState, action: PayloadAction<AudioFile>) => ({
      ...state,
      audioFile: action.payload,
    }),
  },
  extraReducers: (builder) => {
    builder.addCase(loadAndPlayAudioFile.pending, (state) => ({
      ...state,
      AudioFileStatus: AudioFileStatus.Loading,
    }));
  },
});

export const { setIsPlaying, setCurrentTime, setReciter, setAudioFile } =
  audioPlayerStateSlice.actions;

export default audioPlayerStateSlice.reducer;
