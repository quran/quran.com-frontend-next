// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "done.invoke.fetchReciter": {
      type: "done.invoke.fetchReciter";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "done.invoke.fetchRepeatData": {
      type: "done.invoke.fetchRepeatData";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "error.platform.fetchReciter": {
      type: "error.platform.fetchReciter";
      data: unknown;
    };
    "error.platform.fetchRepeatData": {
      type: "error.platform.fetchRepeatData";
      data: unknown;
    };
    "xstate.after(VERSE_DELAY)#audioPlayer.VISIBLE.AUDIO_PLAYER_INITIATED.DELAYING": {
      type: "xstate.after(VERSE_DELAY)#audioPlayer.VISIBLE.AUDIO_PLAYER_INITIATED.DELAYING";
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    fetchReciter: "done.invoke.fetchReciter";
    fetchRepeatData: "done.invoke.fetchRepeatData";
    mediaSessionListener: "done.invoke.audioPlayer.VISIBLE.AUDIO_PLAYER_INITIATED:invocation[0]";
  };
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingActions: {
    decrementAyah: "PREV_AYAH";
    exitRadio:
      | "CONFIRM_PLAY_MISMATCHED_SURAH"
      | "PLAY_AYAH"
      | "PLAY_SURAH"
      | "SET_REPEAT_SETTING";
    forwardEndedToRadioMachine: "END";
    forwardPlayToRadioMachine: "PLAY_RADIO";
    incrementAyah: "NEXT_AYAH";
    nextAudioTrack: "NEXT_AUDIO_TRACK";
    pauseAudio:
      | "CHANGE_RECITER"
      | "CLOSE"
      | "REPEAT_AYAH"
      | "REPEAT_FINISHED"
      | "TOGGLE";
    playAudio:
      | "NEXT_AYAH"
      | "PLAY"
      | "PLAY_AYAH"
      | "PLAY_SURAH"
      | "PREV_AYAH"
      | "TOGGLE"
      | "done.invoke.fetchReciter"
      | "done.invoke.fetchRepeatData"
      | "xstate.after(VERSE_DELAY)#audioPlayer.VISIBLE.AUDIO_PLAYER_INITIATED.DELAYING";
    repeatNextAyah: "NEXT_AYAH";
    repeatPreviousAyah: "PREV_AYAH";
    resetAyahNumber: "CLOSE" | "PLAY_SURAH";
    resetElapsedTime: "CHANGE_RECITER" | "CLOSE";
    seekTo: "SEEK_TO";
    setAudioData: "done.invoke.fetchReciter" | "done.invoke.fetchRepeatData";
    setAudioPlayerCurrentTime:
      | "NEXT_AYAH"
      | "PLAY_AYAH"
      | "PLAY_SURAH"
      | "PREV_AYAH"
      | "REPEAT_AYAH"
      | "done.invoke.fetchReciter"
      | "done.invoke.fetchRepeatData";
    setAudioPlayerSource:
      | "done.invoke.fetchReciter"
      | "done.invoke.fetchRepeatData";
    setAudioRef: "SET_AUDIO_REF";
    setAyahNumber: "PLAY_AYAH";
    setCurrentSurahAndAyahAsNewSurahAndAyah: "CONFIRM_PLAY_MISMATCHED_SURAH";
    setElapsedTime: "TOGGLE";
    setMediaSessionMetaData:
      | "CANCEL_PLAY_MISMATCHED_SURAH"
      | "PLAY_AYAH"
      | "PLAY_SURAH"
      | "done.invoke.fetchReciter"
      | "done.invoke.fetchRepeatData";
    setNewSurahAndAyahNumbers: "PLAY_AYAH";
    setNewSurahAndResetNewAyahNumber: "PLAY_SURAH";
    setPlaybackRate: "SET_PLAYBACK_SPEED";
    setRadioStationDetails: "PLAY_RADIO_TRACK";
    setReciterId: "CHANGE_RECITER";
    setSurahAndAyahNumbers: "PLAY_AYAH";
    setSurahAndResetAyahNumber: "PLAY_SURAH";
    stopRepeatActor:
      | "PLAY_AYAH"
      | "PLAY_RADIO"
      | "PLAY_SURAH"
      | "REPEAT_FINISHED";
    updateRepeatAyah: "PLAY_AYAH";
    updateRepeatVerseTimings: "done.invoke.fetchReciter";
    updateTiming: "UPDATE_TIMING";
  };
  eventsCausingServices: {
    fetchReciter:
      | "CHANGE_RECITER"
      | "CONFIRM_PLAY_MISMATCHED_SURAH"
      | "PLAY_AYAH"
      | "PLAY_RADIO_TRACK"
      | "PLAY_SURAH"
      | "SET_REPEAT_SETTING";
    fetchRepeatData: "SET_REPEAT_SETTING";
    mediaSessionListener:
      | "CANCEL_PLAY_MISMATCHED_SURAH"
      | "PLAY_AYAH"
      | "PLAY_SURAH"
      | "done.invoke.fetchReciter"
      | "done.invoke.fetchRepeatData";
  };
  eventsCausingGuards: {
    isDifferentSurah: "PLAY_AYAH" | "PLAY_SURAH";
    isNotFirstVerse: "PREV_AYAH";
    isNotLastVerse: "NEXT_AYAH";
    isRepeatActive: "NEXT_AYAH" | "PREV_AYAH";
    isSameSurah: "PLAY_AYAH" | "PLAY_SURAH";
  };
  eventsCausingDelays: {
    VERSE_DELAY: "REPEAT_AYAH";
  };
  matchesStates:
    | "HIDDEN"
    | "VISIBLE"
    | "VISIBLE.AUDIO_PLAYER_INITIATED"
    | "VISIBLE.AUDIO_PLAYER_INITIATED.DELAYING"
    | "VISIBLE.AUDIO_PLAYER_INITIATED.ENDED"
    | "VISIBLE.AUDIO_PLAYER_INITIATED.HISTORY"
    | "VISIBLE.AUDIO_PLAYER_INITIATED.PAUSED"
    | "VISIBLE.AUDIO_PLAYER_INITIATED.PAUSED.ACTIVE"
    | "VISIBLE.AUDIO_PLAYER_INITIATED.PAUSED.LOADING"
    | "VISIBLE.AUDIO_PLAYER_INITIATED.PLAYING"
    | "VISIBLE.AUDIO_PLAYER_INITIATED.PLAYING.ACTIVE"
    | "VISIBLE.AUDIO_PLAYER_INITIATED.PLAYING.LOADING"
    | "VISIBLE.FAILED"
    | "VISIBLE.LOADING_RECITER_DATA"
    | "VISIBLE.LOADING_REPEAT_DATA"
    | "VISIBLE.SURAH_MISMATCH"
    | {
        VISIBLE?:
          | "AUDIO_PLAYER_INITIATED"
          | "FAILED"
          | "LOADING_RECITER_DATA"
          | "LOADING_REPEAT_DATA"
          | "SURAH_MISMATCH"
          | {
              AUDIO_PLAYER_INITIATED?:
                | "DELAYING"
                | "ENDED"
                | "PAUSED"
                | "PLAYING"
                | {
                    PAUSED?: "ACTIVE" | "LOADING";
                    PLAYING?: "ACTIVE" | "LOADING";
                  };
            };
      };
  tags: "loading";
}
