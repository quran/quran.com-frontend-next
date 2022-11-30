// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "done.invoke.fetchCustomReciter": {
      type: "done.invoke.fetchCustomReciter";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
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
    "done.invoke.playAudio": {
      type: "done.invoke.playAudio";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "error.platform.fetchCustomReciter": {
      type: "error.platform.fetchCustomReciter";
      data: unknown;
    };
    "error.platform.fetchReciter": {
      type: "error.platform.fetchReciter";
      data: unknown;
    };
    "error.platform.fetchRepeatData": {
      type: "error.platform.fetchRepeatData";
      data: unknown;
    };
    "error.platform.playAudio": {
      type: "error.platform.playAudio";
      data: unknown;
    };
    "xstate.after(500)#audioPlayer.VISIBLE.FAILED": {
      type: "xstate.after(500)#audioPlayer.VISIBLE.FAILED";
    };
    "xstate.after(VERSE_DELAY)#audioPlayer.VISIBLE.AUDIO_PLAYER_INITIATED.DELAYING": {
      type: "xstate.after(VERSE_DELAY)#audioPlayer.VISIBLE.AUDIO_PLAYER_INITIATED.DELAYING";
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    fetchCustomReciter: "done.invoke.fetchCustomReciter";
    fetchReciter: "done.invoke.fetchReciter";
    fetchRepeatData: "done.invoke.fetchRepeatData";
    initMediaSession: "done.invoke.audioPlayer.VISIBLE.AUDIO_PLAYER_INITIATED:invocation[0]";
    playAudio: "done.invoke.playAudio";
  };
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingActions: {
    continueFromLastTimestamp: "END";
    decrementAyah: "PREV_AYAH";
    exitRadio: "PLAY_AYAH" | "PLAY_SURAH" | "SET_REPEAT_SETTING";
    forwardChangeReciterToRadioMachine: "CHANGE_RECITER";
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
    repeatNextAyah: "NEXT_AYAH";
    repeatPreviousAyah: "PREV_AYAH";
    resetAyahNumber: "CLOSE";
    resetElapsedTime: "CHANGE_RECITER" | "CLOSE";
    seekTo: "SEEK_TO";
    seekToAndRepeat: "SEEK_TO";
    setAudioData:
      | "done.invoke.fetchCustomReciter"
      | "done.invoke.fetchReciter"
      | "done.invoke.fetchRepeatData";
    setAudioPlayerCurrentTime:
      | "NEXT_AYAH"
      | "PLAY_AYAH"
      | "PREV_AYAH"
      | "REPEAT_AYAH"
      | "done.invoke.fetchCustomReciter"
      | "done.invoke.fetchReciter"
      | "done.invoke.fetchRepeatData";
    setAudioPlayerSource:
      | "done.invoke.fetchCustomReciter"
      | "done.invoke.fetchReciter"
      | "done.invoke.fetchRepeatData";
    setAudioRef: "SET_AUDIO_REF";
    setAyahNumber: "PLAY_AYAH";
    setElapsedTime: "TOGGLE";
    setInitialContext: "SET_INITIAL_CONTEXT";
    setPlaybackRate: "SET_PLAYBACK_SPEED";
    setRadioStationDetails: "PLAY_RADIO_TRACK";
    setReciterId: "CHANGE_RECITER";
    setRecitersList: "SET_RECITERS_LIST";
    setSurahAndAyahNumbers: "PLAY_AYAH";
    setSurahAndResetAyahNumber: "PLAY_SURAH";
    stopRepeatActor:
      | "PLAY_AYAH"
      | "PLAY_RADIO"
      | "PLAY_SURAH"
      | "REPEAT_FINISHED";
    updateDownloadProgress: "PROGRESS";
    updateRepeatAyah: "PLAY_AYAH";
    updateRepeatVerseTimings:
      | "done.invoke.fetchCustomReciter"
      | "done.invoke.fetchReciter";
    updateTiming: "UPDATE_TIMING";
  };
  eventsCausingServices: {
    fetchCustomReciter: "PLAY_AYAH" | "PLAY_SURAH";
    fetchReciter:
      | "CHANGE_RECITER"
      | "PLAY_AYAH"
      | "PLAY_RADIO_TRACK"
      | "PLAY_SURAH"
      | "SET_REPEAT_SETTING";
    fetchRepeatData: "SET_REPEAT_SETTING";
    initMediaSession:
      | "PLAY_AYAH"
      | "PLAY_SURAH"
      | "done.invoke.fetchCustomReciter"
      | "done.invoke.fetchReciter"
      | "done.invoke.fetchRepeatData";
    playAudio:
      | "END"
      | "NEXT_AYAH"
      | "PLAY"
      | "PLAY_AYAH"
      | "PLAY_SURAH"
      | "PREV_AYAH"
      | "TOGGLE"
      | "done.invoke.fetchCustomReciter"
      | "done.invoke.fetchReciter"
      | "done.invoke.fetchRepeatData"
      | "xstate.after(VERSE_DELAY)#audioPlayer.VISIBLE.AUDIO_PLAYER_INITIATED.DELAYING";
  };
  eventsCausingGuards: {
    canRepeatNextAyah: "NEXT_AYAH";
    canRepeatPrevAyah: "PREV_AYAH";
    isAudioAlmostEnded: "END";
    isDifferentSurah: "PLAY_AYAH" | "PLAY_SURAH";
    isDifferentSurahAndReciter: "PLAY_AYAH";
    isNotFirstVerse: "PREV_AYAH";
    isNotLastVerse: "NEXT_AYAH";
    isRadioActive: "CHANGE_RECITER";
    isRepeatActive: "SEEK_TO";
    isSameAyah: "PLAY_AYAH";
    isSameSurahAndReciter: "PLAY_AYAH" | "PLAY_SURAH";
    isUsingCustomReciterId: "PLAY_AYAH" | "PLAY_SURAH";
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
    | "VISIBLE.LOADING_CUSTOM_RECITER_DATA"
    | "VISIBLE.LOADING_RECITER_DATA"
    | "VISIBLE.LOADING_RECITER_DATA_AND_PAUSE"
    | "VISIBLE.LOADING_REPEAT_DATA"
    | {
        VISIBLE?:
          | "AUDIO_PLAYER_INITIATED"
          | "FAILED"
          | "LOADING_CUSTOM_RECITER_DATA"
          | "LOADING_RECITER_DATA"
          | "LOADING_RECITER_DATA_AND_PAUSE"
          | "LOADING_REPEAT_DATA"
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
