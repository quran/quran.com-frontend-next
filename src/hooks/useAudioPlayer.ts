/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-param-reassign */
import { useCallback } from 'react';
import { createMachine, assign, State, actions } from 'xstate';
import { useMachine } from '@xstate/react';

import {
  END,
  FAIL,
  LOADED,
  PLAY,
  UPDATE_TIMING,
  TOGGLE,
  CAN_PLAY,
  SEEK,
  STALL,
} from 'src/components/AudioPlayer/Events';
import {
  ENDED,
  FAILURE,
  LOADING,
  PAUSED,
  PLAYING,
  READY,
  HISTORY,
} from 'src/components/AudioPlayer/States';

const { pure } = actions;

interface AudioPlayerContext {
  audio: HTMLAudioElement;
  duration: number;
  elapsed: number;
}

type AudioPlayerState =
  | {
      value: typeof LOADING;
      context: AudioPlayerContext & {
        audio: null;
        duration: 0;
        elapsed: 0;
      };
    }
  | {
      value: typeof READY;
      context: AudioPlayerContext & {
        duration: 0;
        elapsed: 0;
      };
    }
  | {
      value: { parent: typeof PAUSED };
      context: AudioPlayerContext;
    }
  | {
      value: { parent: typeof ENDED };
      context: AudioPlayerContext;
    }
  | {
      value: { parent: typeof PLAYING };
      context: AudioPlayerContext;
    }
  | {
      value: typeof FAILURE;
      context: AudioPlayerContext & { audio: null; duration: 0; elapsed: 0 };
    };

interface LoadedEvent {
  type: typeof LOADED;
  audio: HTMLAudioElement;
}
interface FailEvent {
  type: typeof FAIL;
}
interface PlayEvent {
  type: typeof PLAY;
}
interface UpdateTimingEvent {
  type: typeof UPDATE_TIMING;
}
interface EndEvent {
  type: typeof END;
}
interface ToggleEvent {
  type: typeof TOGGLE;
}
interface CanPlayEvent {
  type: typeof CAN_PLAY;
}
interface StallEvent {
  type: typeof STALL;
}
interface SeekEvent {
  type: typeof SEEK;
  time: number;
  isAbsoluteTime: boolean;
}
type AudioPlayerEvent =
  | LoadedEvent
  | FailEvent
  | PlayEvent
  | UpdateTimingEvent
  | EndEvent
  | ToggleEvent
  | CanPlayEvent
  | StallEvent
  | SeekEvent;

/**
 * Action functions
 */
const setAudio = assign({
  audio: (_context, event: LoadedEvent) => event.audio,
  duration: (_context, event: LoadedEvent) => event.audio.duration,
});

const setElapsed = assign({
  elapsed: (context: AudioPlayerContext) => context.audio.currentTime,
});

const playAudio = (context: AudioPlayerContext) => {
  context.audio.play();
};

const pauseAudio = (context: AudioPlayerContext) => {
  context.audio.pause();
};

const restartAudio = (context: AudioPlayerContext) => {
  context.audio.currentTime = 0;
  context.audio.play();
};

const setAudioTime = pure((context: AudioPlayerContext, event: SeekEvent) => {
  let newTime = event.isAbsoluteTime ? event.time : context.audio.currentTime + event.time;
  // upper and lower bound case handling
  if (newTime < 0) {
    newTime = 0;
  } else if (newTime > context.duration) {
    newTime = context.duration;
  }
  context.audio.currentTime = newTime;
  return assign({
    elapsed: () => newTime,
  });
});

const ID = 'audioPlayer';
const audioPlayerMachine = createMachine<AudioPlayerContext, AudioPlayerEvent, AudioPlayerState>({
  id: ID,
  initial: LOADING,
  context: {
    audio: null,
    duration: 0,
    elapsed: 0,
  },
  states: {
    [LOADING]: {
      on: {
        [CAN_PLAY]: {
          target: `#${ID}.${READY}.${HISTORY}`,
          meta: {
            message:
              'When the browser gives the indication that the audio element is ready to play again, we will go back to the previous state which might be READY.PLAYING/READY.PAUSED',
          },
        },
        [LOADED]: {
          target: READY,
          actions: [setAudio],
          meta: {
            message: 'The sura audio file has been loaded.',
          },
        },
        [FAIL]: {
          target: FAILURE,
          meta: {
            message: 'Loading the sura audio file has failed.',
          },
        },
      },
    },
    [READY]: {
      initial: PAUSED,
      states: {
        [PAUSED]: {
          on: {
            [SEEK]: {
              target: `#${ID}.${LOADING}`,
              actions: [setAudioTime],
              meta: {
                message:
                  'When the mouse or keyboard keys are clicked to jump forward/backward 5 or 10 seconds or when the user wants to navigate to a specific time.',
              },
            },
            [STALL]: {
              target: `#${ID}.${LOADING}`,
              meta: {
                message:
                  'When loading the audio stalls (this will happen when the browser is trying to get media data, but data is not available.).',
              },
            },
            [TOGGLE]: {
              target: PLAYING,
              actions: [setElapsed, playAudio],
              meta: {
                message: 'When the space key or the mouse is clicked to continue playing.',
              },
            },
          },
        },
        [PLAYING]: {
          on: {
            [SEEK]: {
              target: `#${ID}.${LOADING}`,
              actions: [setAudioTime],
              meta: {
                message:
                  'When the mouse or keyboard keys are clicked to jump forward/backward 5 or 10 seconds or when the user wants to navigate to a specific time.',
              },
            },
            [STALL]: {
              target: `#${ID}.${LOADING}`,
              meta: {
                message:
                  'When loading the audio stalls (this will happen when the browser is trying to get media data, but data is not available.).',
              },
            },
            [UPDATE_TIMING]: {
              target: PLAYING,
              actions: [setElapsed],
              meta: {
                message:
                  'When The HTMLAudioElement updates its timing, we need to sync our elapsed timing as well.',
              },
            },
            [TOGGLE]: {
              target: PAUSED,
              actions: [setElapsed, pauseAudio],
              meta: {
                message: 'When the space key or the mouse is clicked to pause playing.',
              },
            },
            [END]: ENDED,
          },
        },
        [ENDED]: {
          on: {
            [SEEK]: {
              meta: {
                message:
                  'When the sura audio has ended and the user wants to navigate to a specific time.',
              },
              target: PAUSED,
              actions: [setAudioTime],
            },
            [PLAY]: {
              meta: {
                message: 'When the sura audio has ended and the user clicks play again.',
              },
              target: PLAYING,
              actions: [restartAudio],
            },
          },
        },
        [HISTORY]: {
          type: 'history',
        },
      },
    },
    [FAILURE]: {
      type: 'final',
    },
  },
});

const useAudioPlayer = (): {
  currentState: State<AudioPlayerContext, AudioPlayerEvent, AudioPlayerState>;
  audio: HTMLAudioElement;
  canPlay: (audio: HTMLAudioElement) => void;
  end: () => void;
  fail: () => void;
  updateTiming: () => void;
  toggle: () => void;
  stall: () => void;
  seek: (time: number, isAbsoluteTime?: boolean) => void;
} => {
  const [state, send] = useMachine(audioPlayerMachine);
  const canPlay = useCallback(
    (audio: HTMLAudioElement) => {
      // if we already had loaded the audio, we send the event to indicate that the browser finished loading the seeked time
      if (state.context.audio) {
        send({ type: CAN_PLAY });
      } else {
        send({
          type: LOADED,
          audio,
        });
      }
    },
    [send, state.context.audio],
  );

  const fail = useCallback(() => {
    send({
      type: FAIL,
    });
  }, [send]);

  const end = useCallback(() => {
    send({
      type: END,
    });
  }, [send]);

  const updateTiming = useCallback(() => {
    send({
      type: UPDATE_TIMING,
    });
  }, [send]);

  const toggle = useCallback(() => {
    send({
      type: TOGGLE,
    });
  }, [send]);

  const stall = useCallback(() => {
    send({
      type: STALL,
    });
  }, [send]);

  const seek = useCallback(
    (time: number, isAbsoluteTime = false) => {
      send({
        type: SEEK,
        time,
        isAbsoluteTime,
      });
    },
    [send],
  );

  return {
    currentState: state,
    audio: state.context.audio,
    canPlay,
    fail,
    end,
    updateTiming,
    toggle,
    seek,
    stall,
  };
};

export default useAudioPlayer;
