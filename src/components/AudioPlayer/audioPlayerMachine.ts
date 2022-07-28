/* eslint-disable max-lines */
/* eslint-disable jsdoc/check-tag-names */
import { createContext } from 'react';

import { createMachine, InterpreterFrom, assign, Actor } from 'xstate';

import isCurrentTimeInRange from './hooks/isCurrentTimeInRange';

import { getChapterAudioData } from 'src/api';
import AudioData from 'types/AudioData';

export const audioPlayerMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEMCuECWB7ACgG2QE8wAnAOgAcDCMA7KMjCPMAYhwBkBBATQFEAIolAUssDABdstYSAAeiAKwA2AIxllAFkWrVAZgBMyvQA5digDQhCiAOzGyh2wAZ7Bva4+aAvt6tpMXGpSSmo6BgoSMApkEnDWWVFxKSwZJHlEVU1nAE4yZwK9HNMc501NW00rGwQTE2UyHKy9RRNbPW09VV9-dGx8IhCqInDQkfpWACEAVQAxWb4AJQBJADkAcUSxSWlZBQQVdS0dfSNTc2rEZWVbR0Vy1tUDWxcunpAA-uDyYZp6MgARqgAGbA0jxTi8QRbZK7dL7Q4abS6QzGMyqSzWOwYxzZey2VS2HIGVTKEzvT5BQY-ML-ADuyB29AAwshaANCKxmVxVgB9SE8GE7VJ7JRqJEnVHnDGXBA5bRkEyuHJNRS2Z51cl+D59KnEGnjBgMplQLi6gTICTIVgQVJgRi0ABuWAA1vbKRyhrSjYypPQzYELVaEHRnQBjS3SADazgAukKUmlQAjxccUWd0ZiavplAYyPiPLYTEZtLkKbrPQa-j6TQHsEHraQSFgDRJgS2ALZkD3fMbVsjGv2m82W5Ahp1YCOJmPx9JJYVJjJynQadwtEyKUpGdyyjEksgGCrODxKrotWzlwKVvvxPirATQufbROi5dHNetTfObd6XcqPJrnoRQbpoWjFJeXzUjeEw4Fw0wAMqPiIz5wsmiDyu+QGfluua-liCCkoSB6qDkWgmKUajGBBepeoarCLHwACK0x8PBAAqvLMgAEjy6x8LyDHMssbFLAmqFLmeZBPM4JgdC0zjYVU+FPO4GiKPchLKIoh6aPK1HXr88QMcxrEcasfAABocbwXBcWJIrwlcQGNKYSpNOcOStLKLSaAe34YvcBKKHoWjKPpvaGRMxksex-IMQAassADyCG8jZdlPrCDloQgrkaB0hLOKoRUYu0Sk1D5fkGAYJigQUCkheFUGRVA9FMTFHGIXwADS9mLvsxJ5jcuT3PUyilOU3n3FVNV1QUwVhdqPbNWgsCQOw3D8EImULq+JK+V0BTFmqqi1QSBi7jc6iVK8MnHvoapNfqlCret0WmZxPEbPxgnCaJO0vo5BGaC0ZDBV0NUtCWCl-kV+bBeRtgnTk9QXktFYRa9EBtSZsVdb1APifsTygfkWhFlpRWbjkti7iFeb4ro6qmMYVHo1e3ysHBAjJfym1LLySyLElix9a+ap-nkNMyTTTykcedRPaQXPTDzSV81Ciy8uxXAcBwSEgPOgM5RL+EGK4jRqubajooSKhKyQXLTIsDGrBxbHLAAsvx3G8QbRviTU5saJ51zuLm7i6UpxOtM4B5dOiXRkfUDs4x1GuCoT2VLqb2Yyb5RLlB4hjZCNqfvbFsEIXwYtA9ceTjcVx7aeNyi7kj11AUBKP3GBei+NqtBYBAcCyMtz0tYwzBgLXOWGOoxSksqzybrpsrtCYiol+N8pFRuigO9BERRDEcT0LPS72EcMluZoBjqYYOSyp5m9KqSLQkczZbs5BE-ekfF9iZ73yING4h5URqFlONOOTRd46E0EqRQzhFq9A5s1f+QJQTgnPlnfqiBsiKHyBUYo1Ul4qnKlcMkGgNxvyaBUZQRVD6T0HOEVk7JqCAMQF0Xy5QSpIxKuNLM6FWiKiKuNCm6o1T9x-jRKsowWH+hHFaThuUKhkFAm0QkHh77yifspEKtwQZPHsGUciQEmHehUTVPI0lZIgyQYpWUrQ8whSaAUSGmh9DSNQb-IYWMVFPGmnUEa2k2iuQoQRNQvkbbGAUtoBBh8mwtgCTVPM349CVGJHuXCspza3BaGoDJZJyj6G0IfMMeAxCQBUSoIhWQ77qlKBucasoAC0egDzBW-GdeozxKjIIdiowwdTyjPAME0-8bS6jxw3BiZEINtAGAHt4IAA */
  createMachine(
    {
      context: {
        reciterId: 7 as number, // todo: replace with default reciterId
        chapterId: null as number,
        verseNumber: null as number,
        audioData: null as AudioData,
        currentTimestamp: null as number,
        audioPlayerRef: null as HTMLAudioElement,
        playbackRate: 1 as number,
        repeatActor: null as Actor,
      },
      tsTypes: {} as import('./audioPlayerMachine.typegen').Typegen0,
      schema: {
        events: {} as  // Input Events
          | { type: 'REQUEST_PLAY'; chapterId?: number; verseNumber?: number }
          | { type: 'REQUEST_PAUSE' }
          | { type: 'REQUEST_SEEK'; timestamp: number }
          | { type: 'REQUEST_PLAYBACK_RATE' }
          | { type: 'REQUEST_NEXT_AYAH' }
          | { type: 'REQUEST_PREVIOUS_AYAH' }
          | { type: 'REQUEST_CHANGE_RECITER'; reciterId: number }
          | { type: 'REQUEST_REPEAT'; from: string; to: string }
          // Internal Events
          | { type: 'PLAYED' }
          | { type: 'PAUSED' }
          | { type: 'SEEKED' }
          | { type: 'CAN_PLAY'; audioPlayerRef: HTMLAudioElement }
          | { type: 'CURRENT_TIME_CHANGED'; timestamp: number }
          | { type: 'BUFFERING' }
          | { type: 'ENDED' }
          | { type: 'AUDIO_PLAYER_ERROR' }
          | { type: 'AUDIO_PLAYER_STALLED' },
      },
      id: 'audioPlayer',
      initial: 'closed',
      on: {
        AUDIO_PLAYER_ERROR: {
          target: '.error',
        },
        AUDIO_PLAYER_STALLED: {
          target: '.error',
        },
        CURRENT_TIME_CHANGED: {
          actions: [
            assign({
              activeVerse: (context, event) => getCurrentActiveVerse(),
              currentTimestamp: (context, event: { timestamp: number }) => event.timestamp,
            }),
          ],
        },
        REQUEST_PLAY: {
          actions: assign({
            chapterId: (context: any, event: { chapterId: number }) =>
              event.chapterId || context.chapterId,
            verseNumber: (context: any, event: { verseNumber: number }) =>
              event.verseNumber || context.verseNumber,
          }),
          target: '.playing.preparing',
        },
        REQUEST_PAUSE: {
          actions: 'pauseAudio',
        },
      },
      states: {
        playing: {
          initial: 'preparing',
          states: {
            idle: {
              description: 'The audio player is ready to play',
              tags: 'loading',
              on: {
                PLAYED: {
                  target: 'playing',
                },
              },
            },
            preparing: {
              always: [
                {
                  cond: 'notEnoughData',
                  target: '#audioPlayer.error',
                },
                {
                  cond: 'noAudioData',
                  target: 'waitingAudioData',
                },
                {
                  cond: 'audioPlayerNotReady',
                  target: 'waitingCanPlay',
                },
                {
                  actions: 'playAudio',
                  target: 'idle',
                },
              ],
            },
            playing: {
              on: {
                BUFFERING: {
                  target: 'buffering',
                },
              },
            },
            buffering: {
              on: {
                PLAYED: {
                  target: 'playing.',
                },
              },
            },
            waitingCanPlay: {
              on: {
                CAN_PLAY: {
                  actions: assign({
                    audioPlayerRef: (context, event: { audioPlayerRef: HTMLAudioElement }) =>
                      event.audioPlayerRef,
                  }),
                  target: 'preparing',
                },
              },
            },
            waitingAudioData: {
              invoke: {
                src: (context) => getChapterAudioData(context.reciterId, context.chapterId, true),
                onDone: [
                  {
                    actions: assign({
                      audioData: (context, event) => event.data,
                    }),
                    target: 'preparing',
                  },
                ],
                onError: [
                  {
                    target: '#audioPlayer.error',
                  },
                ],
              },
            },
          },
          on: {
            ENDED: {
              target: 'paused',
            },
            PAUSED: {
              target: 'paused',
            },
            REQUEST_CHANGE_RECITER: {
              actions: assign({
                reciterId: (context, event: { reciterId: number }) => event.reciterId,
                audioData: () => null,
              }),
              target: '.preparing',
            },
            REQUEST_NEXT_AYAH: {
              actions: 'nextAyah',
            },
            REQUEST_PREVIOUS_AYAH: {
              actions: 'prevAyah',
            },
            REQUEST_SEEK: {
              actions: assign({
                currentTimestamp: (context, event: { timestamp: number }) => event.timestamp,
              }),
            },
          },
        },
        paused: {
          on: {
            PLAYED: {
              target: '#audioPlayer.playing.playing',
            },
            REQUEST_CHANGE_RECITER: {
              actions: assign({
                reciterId: (context, event: { reciterId: number }) => event.reciterId,
                audioData: () => null, // reset audioData when reciter changes
              }),
            },
            REQUEST_SEEK: {
              actions: assign({
                currentTimestamp: (context, event: { timestamp: number }) => event.timestamp,
              }),
            },
          },
        },
        error: {},
        closed: {},
      },
    },
    {
      actions: {
        playAudio: (context) => {
          context.audioPlayerRef.play();
        },
        pauseAudio: (context) => {
          context.audioPlayerRef.pause();
        },
        // TODO: handle last ayah & first ayah
        nextAyah: (context) => {
          const currentVerseTiming = context.audioData.verseTimings.findIndex((verse) =>
            isCurrentTimeInRange(
              context.audioPlayerRef.currentTime * 1000,
              verse.timestampFrom,
              verse.timestampTo,
            ),
          );
          const nextVerseTiming = context.audioData.verseTimings[currentVerseTiming + 1];
          const { audioPlayerRef } = context;
          audioPlayerRef.currentTime = nextVerseTiming.timestampFrom / 1000;
        },
        prevAyah: (context) => {
          const currentVerseTiming = context.audioData.verseTimings.findIndex((verse) =>
            isCurrentTimeInRange(
              context.audioPlayerRef.currentTime * 1000,
              verse.timestampFrom,
              verse.timestampTo,
            ),
          );
          const prevVerseTiming = context.audioData.verseTimings[currentVerseTiming - 1];

          const { audioPlayerRef } = context;
          audioPlayerRef.currentTime = prevVerseTiming.timestampFrom / 1000;
        },
      },
      guards: {
        notEnoughData: () => {
          return false; // check if chapterId and reciterId are available
        },
        audioPlayerNotReady: (context) => {
          if (!context.audioPlayerRef) {
            return true;
          }
          if (context.audioData.audioUrl !== context.audioPlayerRef.src) {
            return true;
          }
          if (context.audioPlayerRef.readyState < 4) {
            return true;
          }
          return false;
        },
        noAudioData: (context) => {
          if (!context.audioData) {
            return true;
          }
          if (context.audioData.chapterId !== context.chapterId) {
            return true;
          }

          return false;
        },
      },
    },
  );

export const AudioPlayerMachineContext = createContext(
  {} as InterpreterFrom<typeof audioPlayerMachine>,
);
