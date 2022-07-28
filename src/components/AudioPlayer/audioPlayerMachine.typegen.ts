// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  internalEvents: {
    'done.invoke.audioPlayer.playing.waitingAudioData:invocation[0]': {
      type: 'done.invoke.audioPlayer.playing.waitingAudioData:invocation[0]';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    '': { type: '' };
    'xstate.init': { type: 'xstate.init' };
  };
  invokeSrcNameMap: {};
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingActions: {
    pauseAudio: 'REQUEST_PAUSE';
    nextAyah: 'REQUEST_NEXT_AYAH';
    prevAyah: 'REQUEST_PREVIOUS_AYAH';
    playAudio: '';
  };
  eventsCausingServices: {};
  eventsCausingGuards: {
    notEnoughData: '';
    noAudioData: '';
    audioPlayerNotReady: '';
  };
  eventsCausingDelays: {};
  matchesStates:
    | 'playing'
    | 'playing.idle'
    | 'playing.preparing'
    | 'playing.playing'
    | 'playing.buffering'
    | 'playing.waitingCanPlay'
    | 'playing.waitingAudioData'
    | 'paused'
    | 'error'
    | 'closed'
    | {
        playing?:
          | 'idle'
          | 'preparing'
          | 'playing'
          | 'buffering'
          | 'waitingCanPlay'
          | 'waitingAudioData';
      };
  tags: 'loading';
}
