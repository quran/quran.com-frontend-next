import { describe, expect, it } from 'vitest';
import { State } from 'xstate';

import { audioPlayerMachine } from './audioPlayerMachine';

const getAudioPlayer = () => ({
  currentTime: 0,
  src: '',
  pause: () => null,
  play: () => Promise.resolve(),
});

const getPausedLoadingState = () =>
  State.from(
    { VISIBLE: 'LOADING_RECITER_DATA_AND_PAUSE' },
    {
      ...audioPlayerMachine.initialState.context,
      audioPlayer: getAudioPlayer(),
      surah: 1,
      ayahNumber: 1,
    },
  );

const getFetchReciterDoneEvent = () => ({
  type: 'done.invoke.fetchReciter',
  data: {
    audioUrl: 'https://example.com/audio.mp3',
    duration: 5_000,
    verseTimings: [{ verseKey: '1:1', timestampFrom: 0, timestampTo: 5_000, segments: [] }],
    reciterId: 7,
  },
});

describe('audioPlayerMachine reset flows', () => {
  it('resolves paused reciter reload to PAUSED.ACTIVE and pauses audio', () => {
    const nextState = audioPlayerMachine.transition(
      getPausedLoadingState(),
      getFetchReciterDoneEvent(),
    );

    const actionTypes = nextState.actions.map((action) => action.type);

    expect(nextState.matches('VISIBLE.AUDIO_PLAYER_INITIATED.PAUSED.ACTIVE')).toBe(true);
    expect(nextState.matches('VISIBLE.AUDIO_PLAYER_INITIATED.PAUSED.LOADING')).toBe(false);
    expect(actionTypes).toContain('pauseAudio');
  });
});
