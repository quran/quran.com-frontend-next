/* eslint-disable no-param-reassign */
/* eslint-disable import/prefer-default-export */
/* eslint-disable no-restricted-syntax */
/* eslint-disable jsdoc/check-tag-names */
/* eslint-disable max-lines */

import random from 'lodash/random';
import { assign, createMachine, send, spawn } from 'xstate';
import { pure, stop } from 'xstate/lib/actions';

import { createRadioMachine } from '../radio/radioMachine';
import { createRepeatMachine } from '../repeatMachine/repeatMachine';

import {
  getActiveAyahNumber,
  getActiveVerseTiming,
  getActiveWordLocation,
  executeFetchReciter,
  executeFetchReciterFromEvent,
  getRecitersList,
  getMediaSessionMetaData,
  getAyahNumberByTimestamp,
} from './audioPlayerMachineHelper';
import AudioPlayerContext from './types/AudioPlayerContext';
import AudioPlayerEventType from './types/AudioPlayerEventType';

import { StationType } from '@/components/Radio/types';
import { milliSecondsToSeconds, secondsToMilliSeconds } from '@/utils/datetime';
import AudioData from 'types/AudioData';

/**
 * Note on Safari `onWaiting` hack.
 * ----
 * ISSUES
 * 1) Safari does not fire `onWaiting` event when audio is buffering.
 *    It will just triggger `PAUSE` and immediately followed by `ENDED` state.
 *    as the result, the audio player will enter the `ended` state.
 *
 * If we `.play()` the audio player again, it will start playing from the beginning.
 *
 * 2) If we set the currentTime to be, audioplayer.currentTime = context.elapsed - 000.1
 *    And then do `.play()`
 *    - The audio player will continue playing the audio, the onTimeUpdate event will continue to be triggered
 *    - But there will be no sound. Since the data is actually not yet available
 *    - On the background, safari will attempt to continue fetch mp3 data. Once the data is available. PROGRESS event will be triggered
 *    - and then the audio player will continue from the last played position (based on `context.elapsed`)
 *
 * Workaround we do right now
 * 1) When the audio PAUSE, is trigger, we enter PAUSED.ACTIVE state.
 * 2) Followed by an END state, we just trigger `continueFromLastTimestamp`. Which basically set the currentTime to be `context.elapsed` + `.play()`
 * 3) The audio will enter PLAYING.LOADING, (and then enter PLAYING.ACTIVE for a split second caused by SEEKED, and the enter PLAYING.LOADING again caused by WAITING event)
 * 4) The audioplayer will continue download progress in the background. And then CAN_PLAY will be triggered. -> The audio player will enter PLAYING.ACTIVE again
 *
 * Note
 * - CAN_PLAY and WAITING here. Are not natively triggered by the browser. It's artifial/simulated @see AudioPlayer.tsx onTimeUpdate for the implementation details
 * - continueFromLastTimestamp will not be called when the audio is `isAudioAlmostEnded`. Because in this case the safari behavior is correct. The audio is ended.
 *   so no need to continue downloading and playing the audio
 *
 */

export const audioPlayerMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEMCuECWB7ACgG2QE8wAnAOgAkBJAERoFEA5AYhwBkBBATQH0AlDjSoB5RKAAOWWBgAu2AHZiQAD0QAOAJxkADJo0A2DWu0B2AIxqTAZgBMAGhCFEAVltkALBq-7DJ5140rAF8ghzRMXAJicmo6JlZOXgEhYR4AFQEAYQBpJUlpOSxFJBVEK20zMhNNGzV9GzN3bWcLBycEG2sPAM99E20GmytnELD0bHwiUkpaBhZ2bh5uDgo8qVkFJVUEcsrqjVr6xubWx0R3KzVur2H9Y2MbZ3dRkHCJqOnYuYTFgGUAVQEqxK+Q2RS2ZQqVRqdQaTRaajaiH0Zkqni87mM7gad2eoVe40iUxis3iv3oaR4Cy4ACEODkeL8cPR6DQ1gVNiVtmZtFYyGp-O4fEN9M41FYDEidmoruiNCYbF5nNptEKTC83kTojM4ixMhQOIwAOL0fj0TJUNL0PjssHFUDcixkMxWXH+ZV+Mz+KU2dzua4GEw3cVeDWEybagBqVF+VBpbHoZABQJ4AFkY6mOGl9cxMsJGAAxKh8VNUxJpjNZ-WsxmAla2wr20oIVGi508-qGMz6Wx1KUtCVVF0yqyuoXisMRCPTaOx+OJ5MrCu-TPZii5w2ZehsMuLdMrqsUGuL4ESdaNiEtizOdumbRdnuHKVex5kALmKx+J4KtST97EshZzjBMyA4f4Ul3LhrR4KhGEtKgs1ZMgcDA8kaFAzI0ioSN6GYNJhCNI0EwbTkHUhfRtDIRUFU8MwNG7FUTB9GUTCo45nBsQY+ncdV8U1adyCA+dQPAkRIOg2D4MQ9CUP+NCMKwnDmHJehchBc9SObR5zB0ao-B4lFDF9H0-T2F1+gefplTxMYpw+QSY2AxMwIg6kJLgrDpOQ1CkPpRTcN+NIODYNgSPBLlEG0ypTEsb9DIOdwfUMf0P3MDR3DMGxtA0Zo-y1GdHOElyxLcvgYI8hCrRknz0L87DcOpMKm22coKKo+VfXo+iKNMKVyi6BpLiMCpdDo4I+PDezAMKkDitSUryqkqrvLk3zMPq5gmDZdSOXCsidlVSjqM6uiGN6s4dkCG9UvFXozGqfQ8oE6a51m0T5sSdylqQ2T5LYYRBFgo1mEYegAA1KWWU8QFBC8Io6awbwFLK1B49xnCDEy7iHT9UYeTKnqmoS3tcz6yskzzlt+pD-sB41WD4ehIyWLh6x2u1L06YZ+Q43Q0YxjQfSy1iP1FTRVXS0dCYA4nnPe8TyYqrzqfQ2mhHpgsOCoUL2bh-b0fo517mcayeKGZ8Whvd9MRldLON-Ca7Jlma5dJ7gvspn6arINWgY3RhIKazmKJsMhXAMUVamol0fQlPkP00YwXVsIZpajF2RLdqDFe+9CGESP3QYhlm2bPXbmshYx2porqzqYi77pla4rMVQxmhsNOCte12SrJxbPbz7duD9nBGeZqGg-h8oq+O2jusYkzLDYiV-DUIYcod2z-3T7vM9792c4Hsh8+H+nlFgGRkBkMAyGQAAza+SAAChwvhyR4E+uAASmYfiiYzuaCt+6VSQp-IGk99qtSOh1OeddmKDkGrbE2wxVSdwcrvQBC0KYgJkgXY0CkNr4UIsRXWmkWqfi0CYC4qIYTUT6llLQg1rD3isNiAYaCXpOT3h9A+wDlZ4KNAQpSjNmRZhLtDWGZCygUKqNQiwBw17yj6tif0TDOjNB4mKXiW98roK4Zgvu2D+Gn0EXVJSKk1Jlw5lPUUlQJRGA0MqCUMV67tAaPeHmfQvCmGcD2DhstuFAKMVTARQiApBRChA5sroWhkHsZoJxOU9Kx38J4tQPIhT3m0QSJ2O99HyywUrEJJiwmbUYNtKxetmwZTaiiHK6U-BGAVElV8ApuJZJysg-xACCmGKKT9UJZjcL-BwDQRC6QqDpmNFElqQoUpyNoUoi6jwPG3B8LCRothHqO23l3fJWcPY4OQoM9aSlqYzOkUGWRVgaEKLoRdV0zRl4mFFC8u4SpukYN6bw4JAySm+3pkXSGrMJEaT2tE8U+hnTWE4sqIY90MY+k2W+LwVl6gDBRJ8-Z+9s58OKVwIGPsAbq2BqPJm4iLnSldNClOcKbl+FcYgCwa8UXyl8aqMUzRsl-2dl8g5h8jnUkJQC4GmttaUsyZUCwugTaqjNlYZ8tgrZeFRmKYYDDuWTV5dinhuLfm4P+cSv2mRDSB1IeClqdxQ51F0M0dlwxGUdGaFcNpDj7x0XYTs3RnCirfL1f09CW1WTKRZJYmGYKK4dFYVcAwBgZTZXSfdBVF0mgHBxmvAUHETYaCxb6-leKkJBpoD8LglLRxXKoTc+RUclntE-K4HG+h0amFYd+XNJMcWHK8kWktFLzWRuvFoVULzeydBNj2KUmJfTpruDKROm8cm7L0XmztAru3lODdSWsQJKWDp0AZUdX4J0psuNdYc9j62hi9c9AJBifkBrID2ohRF6ASuOGQOp2VNFNPsA3DirF0RBmsPUG5fjr3-z5augtgaN3Fq3ckMSGR6RhskRaplAoh0Hqjke5N7RXCqhnT4DJJhNW5L2Su3VXaqrMBEfQMRRY4K-CPBU8N5dObdi0J4WoK8m2OPuj6JJ-IDg9lMPKIw2ydE3p6fm-VINwbAtLqx6xkDWofvKIqV0jjXR+ClAcViAR5SjkMmvUjS6fUdso2u6jZLx4grLapkTGnDCuD6M4fsfhWWOO-KYGwYHJMQa4SKs0ForRlTGUFZgEAig3wwPIAAblgAA1jfO+YAZAAGMAAWfAwDpdkKQXdGH90juw+O3DTKfB8nfAOVuHZ22JiC4zEL0FwscGYKQEgWByDiAIDIO+XWAC2ZBUsZey7l-LJBCupOHY+EzZX+zKjMpcZtGNuL1aJXTI0ZpRGUla5F6LZBYsJeS8NtLWWcviDAFfGgV9kC7oqHyC4zqjAZU4ulfsFxPOpsCCRxx63Gv0B2x-LMbWOtdbID1q+-WSBDZG+dsAl3ru3fuy6Dw5QxQvcyoqRKKbuyecMA0vo5QbKLu9bLXM-1ySUqeNa+iVavF9EVFKTQnnqjpMuCR8a-ntXzhDZSakdIGRMhZCx1DkbOiBHap+HibPfPin7OKMyTRm3o14-V3MBpjSmia5aa0lLDJhweq89KfoXkfcMOmjiRwsnq-g4DVISGcj67xxjOoxu-QGX7MTwjKJh2mbJy7XtE9+2XgN67nwAsPdm4bncSovim3WBuba-3Unu69pPM7qF4f3em-0M+HilF48OrXsMQMtvywIdECH+GnRqhh19I8F0YpLC-rw1Qs9lxuINA+eB4kfOljy0ZgWSljfWIJJdIYWwnuLo9TPRlcwcu7gjF79EfvtGxHkjSFhaZ1f9qIobi81nmgXnSoMCEfE8gsAQDgEoHl2ovhMH1635EQwAxWpeYEBo62TzLlXPqSl8olEzKyovI5gPYdwFsJscSqKTwhmnEfo62d6-qucK08kQyI+FwMahgs6CaqI1gAm6Mzo2I46ji942IXOpOqeOqQSD6KsG2JKI+Lyqi8KXoicIBbmyy1gKULo9E94XgrciBfqVGXsq0ouEanMGU-osaOBRgeB5WTqRgOMTBPYziy+3OeSFGNBKBYCO+lSUiHQHG3Q3GjivGLQjqdEyo0BgYlwzQoGFBd+5GFmWhR8Qq+C6Bu+0Sng-oLQvgMSHq94SUUBtwQYmIHuhgghMmtBoSIqZadQ3hfoFEMog0TOyyqarKPELEdEf2K+jhPclm0GxyJiZafolElatyNa5hCooc1sc6ds9hWqGhThhSKB1AgUwgfApaHh2wDQVCRhIYvingZhFslwzchmIG3Y9RZGy6TRfSKBRaEq1COgvo1gMoxBMofUQYVwTCBsnEh0KeAWmhzRA8I+jQN4XG-Rph-GDcTQUKcovI2UmU1QHcOR0xiYYqCYYhbG8MQo8oukXUoon45QgsDcgJzoKqFQAop03Y-2RqxowWuuYWIOu6WaQ4DCKoEokceeF0rgqOCc1QpgQYX+Lx5mDWsJW26+u2SJXRL+ceRukeuek6GUnma87ywsOaxJss1Oaa2e9J0+biji+O34ngo47J6hBW1JOw8hUKKoMpspspjQ5+QQQAA */
  createMachine(
    {
      context: {
        audioPlayer: null,
        reciterId: 7,
        ayahNumber: 1,
        elapsed: 0,
        downloadProgress: 0,
        duration: 0,
        audioData: undefined,
        playbackRate: 1,
        shouldPlayFromRandomTimeStamp: false,
        surahVersesCount: 0,
        repeatActor: null,
        radioActor: null,
        verseDelay: 0,
        volume: 1,
      },
      tsTypes: {} as import('./audioPlayerMachine.typegen').Typegen0,
      schema: {
        context: {} as AudioPlayerContext,
        events: {} as AudioPlayerEventType,
        services: {} as {
          fetchReciter: {
            data: AudioData;
          };
        },
      },
      id: 'audioPlayer',
      initial: 'HIDDEN',
      states: {
        HIDDEN: {
          description: 'Audio player is hidden in the UI',
          on: {
            PLAY_RADIO: {
              actions: ['stopRepeatActor', 'forwardPlayToRadioMachine'],
            },
            CLOSE_RADIO: {
              actions: ['pauseAudio', 'exitRadio'],
            },
            PLAY_RADIO_TRACK: {
              actions: 'setRadioStationDetails',
              description: 'User opens the audio player to play radio of a certain station',
              target: 'VISIBLE',
            },
            PLAY_AYAH: [
              {
                actions: ['setSurahAndAyahNumbers', 'exitRadio'],
                description: 'User opens the audio player to play an Ayah',
                cond: 'isUsingCustomReciterId',
                target: 'VISIBLE.LOADING_CUSTOM_RECITER_DATA',
              },
              {
                actions: ['setSurahAndAyahNumbers', 'exitRadio'],
                description: 'User opens the audio player to play an Ayah',
                target: 'VISIBLE',
              },
            ],
            PLAY_SURAH: [
              {
                actions: ['setSurahAndResetAyahNumber', 'exitRadio'],
                cond: 'isUsingCustomReciterId',
                target: 'VISIBLE.LOADING_CUSTOM_RECITER_DATA',
              },
              {
                actions: ['setSurahAndResetAyahNumber', 'exitRadio'],
                description: 'User opens the audio player to play a Surah',
                target: 'VISIBLE',
              },
            ],
            SET_PLAYBACK_SPEED: {
              actions: 'setPlaybackRate',
              description: 'User change the playback speed',
            },
            CHANGE_RECITER: [
              {
                actions: 'setReciterId',
                description: 'User changes the reciter',
              },
            ],
          },
        },
        VISIBLE: {
          description: 'Audio player is visible in the UI',
          initial: 'LOADING_RECITER_DATA',
          states: {
            AUDIO_PLAYER_INITIATED: {
              description: 'File has been loaded and is ready to be played',
              initial: 'PAUSED',
              invoke: {
                src: 'initMediaSession',
              },
              states: {
                PAUSED: {
                  description: 'Default state of the audio player',
                  initial: 'ACTIVE',
                  states: {
                    ACTIVE: {
                      on: {
                        TOGGLE: {
                          actions: 'setElapsedTime',
                          description:
                            'User either clicks on the play button or presses the space key',
                          target: '#audioPlayer.VISIBLE.AUDIO_PLAYER_INITIATED.PLAYING.ACTIVE',
                        },
                        SEEKING: {
                          description:
                            'When the mouse or keyboard keys are clicked to jump forward/backward 5 or 10 seconds or when the user wants to navigate to a specific time.',
                          target: 'LOADING',
                        },
                        WAITING: {
                          description: 'Waiting for the buffer to be filled',
                          target: 'LOADING',
                        },
                        PLAY: {
                          description: 'Play the audio again',
                          target: '#audioPlayer.VISIBLE.AUDIO_PLAYER_INITIATED.PLAYING.ACTIVE',
                        },
                        END: [
                          {
                            cond: 'isAudioAlmostEnded',
                            actions: 'forwardEndedToRadioMachine',
                            description: 'Current file ended playing',
                            target: '#audioPlayer.VISIBLE.AUDIO_PLAYER_INITIATED.ENDED',
                          },
                          {
                            /**
                             * This is a hack for safari.
                             * In safari. The audio goes to ended state once the there's not enough data to play the audio.
                             */
                            actions: 'continueFromLastTimestamp',
                            target: '#audioPlayer.VISIBLE.AUDIO_PLAYER_INITIATED.PLAYING.LOADING',
                          },
                        ],
                      },
                    },
                    LOADING: {
                      description: 'Audio data is being fetched',
                      tags: 'loading',
                      on: {
                        NEXT_AYAH: [
                          {
                            actions: 'repeatNextAyah',
                            cond: 'canRepeatNextAyah',
                          },
                          {
                            actions: ['incrementAyah', 'setAudioPlayerCurrentTime'],
                            description:
                              "User clicks the next ayah button and it's not the last ayah of the surah already",
                            cond: 'isNotLastVerse',
                          },
                        ],
                        PREV_AYAH: [
                          {
                            actions: 'repeatPreviousAyah',
                            cond: 'canRepeatPrevAyah',
                          },
                          {
                            actions: ['decrementAyah', 'setAudioPlayerCurrentTime'],
                            description:
                              "User clicks the previous ayah button and it's not the first ayah of the surah already",
                            cond: 'isNotFirstVerse',
                          },
                        ],
                        FAIL: {
                          description: 'The audio file failed to load',
                          target: '#audioPlayer.VISIBLE.FAILED',
                        },
                        CAN_PLAY: {
                          target: 'ACTIVE',
                        },
                        SEEKED: {
                          target: 'ACTIVE',
                        },
                        END: {
                          actions: 'forwardEndedToRadioMachine',
                          description: 'Current file ended playing',
                          target: '#audioPlayer.VISIBLE.AUDIO_PLAYER_INITIATED.ENDED',
                        },
                      },
                    },
                  },
                },
                DELAYING: {
                  after: {
                    VERSE_DELAY: {
                      target: '#audioPlayer.VISIBLE.AUDIO_PLAYER_INITIATED.PLAYING.ACTIVE',
                    },
                  },
                  on: {
                    TOGGLE: {
                      target: '#audioPlayer.VISIBLE.AUDIO_PLAYER_INITIATED.PLAYING.ACTIVE',
                    },
                    NEXT_AYAH: [
                      {
                        actions: 'repeatNextAyah',
                        cond: 'canRepeatNextAyah',
                        target: '#audioPlayer.VISIBLE.AUDIO_PLAYER_INITIATED.PLAYING.ACTIVE',
                      },
                      {
                        actions: ['incrementAyah', 'setAudioPlayerCurrentTime'],
                        description:
                          "User clicks the next ayah button and it's not the last ayah of the surah already",
                        cond: 'isNotLastVerse',
                      },
                    ],
                    PREV_AYAH: [
                      {
                        actions: 'repeatPreviousAyah',
                        cond: 'canRepeatPrevAyah',
                        target: '#audioPlayer.VISIBLE.AUDIO_PLAYER_INITIATED.PLAYING.ACTIVE',
                      },
                      {
                        actions: ['decrementAyah', 'setAudioPlayerCurrentTime'],
                        description:
                          "User clicks the previous ayah button and it's not the first ayah of the surah already",
                        cond: 'isNotFirstVerse',
                      },
                    ],
                  },
                },
                PLAYING: {
                  invoke: {
                    id: 'playAudio',
                    src: 'playAudio',
                    onError: {
                      target: '#audioPlayer.VISIBLE.AUDIO_PLAYER_INITIATED.PAUSED.ACTIVE',
                    },
                  },
                  description: 'The audio player is playing the audio',
                  initial: 'ACTIVE',
                  on: {
                    PLAY_AYAH: [
                      {
                        actions: ['setSurahAndAyahNumbers', 'exitRadio', 'stopRepeatActor'],
                        description: 'When the user chooses to play an Ayah of another Surah',
                        cond: 'isDifferentSurahAndReciter',
                        target: '#audioPlayer.VISIBLE.LOADING_CUSTOM_RECITER_DATA',
                      },
                      {
                        actions: ['setSurahAndAyahNumbers', 'exitRadio', 'stopRepeatActor'],
                        description: 'When the user chooses to play an Ayah of another Surah',
                        cond: 'isDifferentSurah',
                        target: '#audioPlayer.VISIBLE.LOADING_RECITER_DATA',
                      },
                      {
                        actions: ['setSurahAndAyahNumbers', 'setAudioPlayerCurrentTime'],
                      },
                    ],
                    CHANGE_RECITER: [
                      {
                        actions: ['pauseAudio', 'setReciterId', 'resetElapsedTime'],
                        description:
                          'User changes the reciter while the audio player is visible and might be playing',
                        target: '#audioPlayer.VISIBLE.LOADING_RECITER_DATA',
                      },
                    ],
                  },
                  states: {
                    ACTIVE: {
                      on: {
                        TOGGLE: {
                          actions: ['setElapsedTime', 'pauseAudio'],
                          description:
                            'User either clicks on the pause button or presses the space key',
                          target: '#audioPlayer.VISIBLE.AUDIO_PLAYER_INITIATED.PAUSED.ACTIVE',
                        },
                        REPEAT_AYAH: {
                          actions: [
                            assign({
                              ayahNumber: (context, event: any) => event.ayahNumber,
                              verseDelay: (context, event: any) => event.verseDelay,
                            }),
                            'pauseAudio',
                            'setAudioPlayerCurrentTime',
                          ],
                          description: 'Repeat the current ayah',
                          target: '#audioPlayer.VISIBLE.AUDIO_PLAYER_INITIATED.DELAYING',
                        },
                        SEEKING: {
                          description:
                            'When the mouse or keyboard keys are clicked to jump forward/backward 5 or 10 seconds or when the user wants to navigate to a specific time.',
                          target: 'LOADING',
                        },
                        WAITING: {
                          description: 'Waiting for the buffer to be filled',
                          target: 'LOADING',
                        },
                        END: {
                          actions: 'forwardEndedToRadioMachine',
                          description: 'The audio finished played',
                          target: '#audioPlayer.VISIBLE.AUDIO_PLAYER_INITIATED.ENDED',
                        },

                        UPDATE_TIMING: {
                          actions: 'updateTiming',
                          description: 'Update the elapsed time ',
                        },
                        PAUSE: {
                          description: 'Pause the audio',
                          target: '#audioPlayer.VISIBLE.AUDIO_PLAYER_INITIATED.PAUSED.ACTIVE',
                        },
                      },
                    },
                    LOADING: {
                      description: 'Audio data is being fetched',
                      tags: 'loading',
                      on: {
                        NEXT_AYAH: [
                          {
                            actions: 'repeatNextAyah',
                            cond: 'canRepeatNextAyah',
                          },
                          {
                            actions: ['incrementAyah', 'setAudioPlayerCurrentTime'],
                            description:
                              "User clicks the next ayah button and it's not the last ayah of the surah already",
                            cond: 'isNotLastVerse',
                          },
                        ],
                        PREV_AYAH: [
                          {
                            actions: 'repeatPreviousAyah',
                            cond: 'canRepeatPrevAyah',
                          },
                          {
                            actions: ['decrementAyah', 'setAudioPlayerCurrentTime'],
                            description:
                              "User clicks the previous ayah button and it's not the first ayah of the surah already",
                            cond: 'isNotFirstVerse',
                          },
                        ],
                        FAIL: {
                          description: 'The audio file failed to load',
                          target: '#audioPlayer.VISIBLE.FAILED',
                        },
                        CAN_PLAY: {
                          target: 'ACTIVE',
                        },
                        PAUSE: {
                          description: 'Pause the audio',
                          target: '#audioPlayer.VISIBLE.AUDIO_PLAYER_INITIATED.PAUSED.ACTIVE',
                        },
                        SEEKED: {
                          target: 'ACTIVE',
                        },
                      },
                    },
                  },
                },
                HISTORY: {
                  history: 'shallow',
                  type: 'history',
                },
                ENDED: {
                  on: {
                    SEEKING: {
                      description:
                        'When the mouse or keyboard keys are clicked to jump forward/backward 5 or 10 seconds or when the user wants to navigate to a specific time.',
                      target: 'PAUSED',
                    },
                    PLAY: {
                      description: 'Play the audio again',
                      target: 'PLAYING',
                    },
                    PLAY_AYAH: [
                      {
                        actions: ['setSurahAndAyahNumbers', 'exitRadio', 'stopRepeatActor'],
                        description: 'When the user chooses to play an Ayah of another Surah',
                        cond: 'isDifferentSurahAndReciter',
                        target: '#audioPlayer.VISIBLE.LOADING_CUSTOM_RECITER_DATA',
                      },
                      {
                        actions: ['setSurahAndAyahNumbers', 'exitRadio', 'stopRepeatActor'],
                        description: 'When the user chooses to play an Ayah of another Surah',
                        cond: 'isDifferentSurah',
                        target: '#audioPlayer.VISIBLE.LOADING_RECITER_DATA',
                      },
                      {
                        actions: [
                          'setAyahNumber',
                          'setAudioPlayerCurrentTime',
                          'exitRadio',
                          'updateRepeatAyah',
                        ],
                        description:
                          'When the user chooses to play an Ayah of the same Surah. (can be the same Ayah being recited)',
                        cond: 'isSameSurahAndReciter',
                        target: 'PLAYING',
                      },
                    ],
                    PLAY_SURAH: [
                      {
                        actions: ['setSurahAndResetAyahNumber', 'exitRadio', 'stopRepeatActor'],
                        cond: 'isUsingCustomReciterId',
                        target: '#audioPlayer.VISIBLE.LOADING_CUSTOM_RECITER_DATA',
                      },
                      {
                        actions: ['setSurahAndResetAyahNumber', 'exitRadio', 'stopRepeatActor'],
                        description: 'When the user chooses to play another Surah',
                        cond: 'isDifferentSurah',
                        target: '#audioPlayer.VISIBLE.LOADING_RECITER_DATA',
                      },
                      {
                        actions: ['exitRadio'],
                        description:
                          'When the user chooses to play an Ayah of the same Surah. (can be the same Ayah being recited)',
                        cond: 'isSameSurahAndReciter',
                        target: 'PLAYING',
                      },
                    ],
                    TOGGLE: {
                      description: 'User clicks on the play button or presses the space key',
                      target: 'PLAYING',
                    },
                    PLAY_RADIO_TRACK: {
                      actions: 'setRadioStationDetails',
                      description: 'User opens the audio player to play radio of a certain station',
                      target: '#audioPlayer.VISIBLE.LOADING_RECITER_DATA',
                    },
                  },
                },
              },
              on: {
                PROGRESS: {
                  actions: 'updateDownloadProgress',
                },
                REPEAT_FINISHED: {
                  actions: ['stopRepeatActor', 'pauseAudio'],
                  target: '.PAUSED.ACTIVE',
                },
                NEXT_AYAH: [
                  {
                    actions: 'repeatNextAyah',
                    cond: 'canRepeatNextAyah',
                  },
                  {
                    actions: ['incrementAyah', 'setAudioPlayerCurrentTime'],
                    description:
                      "User clicks the next ayah button and it's not the last ayah of the surah already",
                    cond: 'isNotLastVerse',
                  },
                ],
                NEXT_AUDIO_TRACK: {
                  actions: 'nextAudioTrack',
                },
                SEEK_TO: [
                  {
                    cond: 'isRepeatActive',
                    actions: 'seekToAndRepeat',
                  },
                  {
                    actions: 'seekTo',
                  },
                ],
                PREV_AYAH: [
                  {
                    actions: 'repeatPreviousAyah',
                    cond: 'canRepeatPrevAyah',
                  },
                  {
                    actions: ['decrementAyah', 'setAudioPlayerCurrentTime'],
                    description:
                      "User clicks the previous ayah button and it's not the first ayah of the surah already",
                    cond: 'isNotFirstVerse',
                  },
                ],
              },
            },
            FAILED: {
              description:
                'Either the audio file failed to load or the API to fetch the reciter + Surah data failed',
              after: {
                500: {
                  target: '#audioPlayer.HIDDEN',
                },
              },
            },
            LOADING_RECITER_DATA: {
              description: 'The reciter + Surah data are being fetched',
              invoke: {
                src: 'fetchReciter',
                id: 'fetchReciter',
                onDone: [
                  {
                    actions: [
                      'setAudioData',
                      'setAudioPlayerSource',
                      'setAudioPlayerCurrentTime',
                      'updateRepeatVerseTimings',
                    ],
                    description: 'The API call to get the selected chapter + Surah succeeded',
                    target: '#audioPlayer.VISIBLE.AUDIO_PLAYER_INITIATED.PLAYING.LOADING',
                  },
                ],
                onError: [
                  {
                    description: 'The API call to get the selected chapter + Surah failed',
                    target: 'FAILED',
                  },
                ],
              },
              tags: 'loading',
            },
            LOADING_RECITER_DATA_AND_PAUSE: {
              description: 'The reciter + Surah data are being fetched',
              invoke: {
                src: 'fetchReciter',
                id: 'fetchReciter',
                onDone: [
                  {
                    actions: [
                      'setAudioData',
                      'setAudioPlayerSource',
                      'setAudioPlayerCurrentTime',
                      'updateRepeatVerseTimings',
                    ],
                    description: 'The API call to get the selected chapter + Surah succeeded',
                    target: '#audioPlayer.VISIBLE.AUDIO_PLAYER_INITIATED.PAUSED.LOADING',
                  },
                ],
                onError: [
                  {
                    description: 'The API call to get the selected chapter + Surah failed',
                    target: 'FAILED',
                  },
                ],
              },
              tags: 'loading',
            },
            LOADING_CUSTOM_RECITER_DATA: {
              description: 'The reciter + Surah data are being fetched',
              invoke: {
                src: 'fetchCustomReciter',
                id: 'fetchCustomReciter',
                onDone: [
                  {
                    actions: [
                      'setAudioData',
                      'setAudioPlayerSource',
                      'setAudioPlayerCurrentTime',
                      'updateRepeatVerseTimings',
                    ],
                    description: 'The API call to get the selected chapter + Surah succeeded',
                    target: '#audioPlayer.VISIBLE.AUDIO_PLAYER_INITIATED.PLAYING.LOADING',
                  },
                ],
                onError: [
                  {
                    description: 'The API call to get the selected chapter + Surah failed',
                    target: 'FAILED',
                  },
                ],
              },
              tags: 'loading',
            },
            LOADING_REPEAT_DATA: {
              invoke: {
                src: 'fetchRepeatData',
                id: 'fetchRepeatData',
                onDone: [
                  {
                    actions: [
                      'setAudioData',
                      'setAudioPlayerSource',
                      'setAudioPlayerCurrentTime',
                      assign({
                        surah: (context, event: any) => event.data.surah,
                        ayahNumber: (context, event: any) => event.data.from,
                        repeatActor: (context: any, event) => {
                          return spawn(
                            createRepeatMachine({
                              fromVerseNumber: event.data.from,
                              toVerseNumber: event.data.to,
                              totalRangeCycle: event.data.repeatRange,
                              totalVerseCycle: event.data.repeatEachVerse,
                              verseTimings: context.audioData.verseTimings,
                              delayMultiplier: event.data.delayMultiplier,
                            }),
                          ) as any;
                        },
                      }),
                    ],
                    description: 'The API call to get the selected chapter + Surah succeeded',
                    target: '#audioPlayer.VISIBLE.AUDIO_PLAYER_INITIATED.PLAYING.LOADING',
                  },
                ],
                onError: [
                  {
                    description: 'The API call to get the selected chapter + Surah failed',
                    target: 'FAILED',
                  },
                ],
              },
              tags: 'loading',
            },
          },
          on: {
            CLOSE: {
              actions: ['resetElapsedTime', 'resetAyahNumber', 'pauseAudio'],
              description: 'User closes the audio player',
              target: 'HIDDEN',
            },
            SET_PLAYBACK_SPEED: {
              actions: 'setPlaybackRate',
              description: 'User change the playback speed',
            },
            CHANGE_RECITER: [
              {
                cond: 'isRadioActive',
                actions: 'forwardChangeReciterToRadioMachine',
              },
              {
                actions: ['pauseAudio', 'setReciterId', 'resetElapsedTime'],
                description:
                  'User changes the reciter while the audio player is visible and might be playing',
                target: '.LOADING_RECITER_DATA_AND_PAUSE',
              },
            ],
            PLAY_RADIO_TRACK: {
              actions: 'setRadioStationDetails',
              description: 'User opens the audio player to play radio of a certain station',
              target: '.LOADING_RECITER_DATA',
            },
            PLAY_AYAH: [
              {
                description:
                  'When the user is clicking play ayah. On the currently playing ayah, resume it',
                cond: 'isSameAyah',
                target: '.AUDIO_PLAYER_INITIATED.PLAYING.ACTIVE',
              },
              {
                actions: ['setSurahAndAyahNumbers', 'exitRadio', 'stopRepeatActor'],
                description: 'When the user chooses to play an Ayah of another Surah',
                cond: 'isDifferentSurah',
                target: 'VISIBLE.LOADING_RECITER_DATA',
              },
              {
                actions: [
                  'setAyahNumber',
                  'setAudioPlayerCurrentTime',
                  'exitRadio',
                  'updateRepeatAyah',
                ],
                description:
                  'When the user chooses to play an Ayah of the same Surah. (can be the same Ayah being recited)',
                cond: 'isSameSurahAndReciter',
                target: '.AUDIO_PLAYER_INITIATED.PLAYING.LOADING',
              },
            ],
            PLAY_SURAH: [
              {
                description: 'When the users is playing the same surah. Just resume it',
                cond: 'isSameSurahAndReciter',
                target: '.AUDIO_PLAYER_INITIATED.PLAYING.ACTIVE',
              },
              {
                actions: ['setSurahAndResetAyahNumber', 'exitRadio', 'stopRepeatActor'],
                cond: 'isUsingCustomReciterId',
                target: 'VISIBLE.LOADING_CUSTOM_RECITER_DATA',
              },
              {
                actions: ['setSurahAndResetAyahNumber', 'exitRadio', 'stopRepeatActor'],
                description: 'When the user chooses to play another Surah',
                cond: 'isDifferentSurah',
                target: 'VISIBLE.LOADING_RECITER_DATA',
              },
            ],
            PLAY_RADIO: {
              actions: ['stopRepeatActor', 'forwardPlayToRadioMachine'],
            },
            CLOSE_RADIO: {
              actions: ['pauseAudio', 'exitRadio'],
              target: 'HIDDEN',
            },
            UPDATE_VOLUME: {
              actions: 'updateVolume',
              description: 'User updates the volume',
            },
          },
        },
      },
      on: {
        SET_AUDIO_REF: {
          actions: 'setAudioRef',
        },
        SET_REPEAT_SETTING: {
          actions: ['exitRadio'],
          target: '.VISIBLE.LOADING_REPEAT_DATA',
        },
        SET_INITIAL_CONTEXT: {
          actions: 'setInitialContext',
        },
        SET_RECITERS_LIST: {
          actions: 'setRecitersList',
        },
      },
    },
    {
      actions: {
        continueFromLastTimestamp: (context) => {
          /**
           * This is hack for safari where the audioplayer goes to ended, instead of waiting for the buffer data
           */
          context.audioPlayer.currentTime = context.elapsed - 0.0001;
          context.audioPlayer.play();
        },
        setRecitersList: assign({
          recitersList: (context, event) => event.recitersList,
        }),
        setInitialContext: assign({
          reciterId: (context, event) => event.reciterId,
          playbackRate: (context, event) => event.playbackRate,
          volume: (context, event) => event.volume,
        }),
        updateRepeatAyah: pure((context, event) => {
          if (context.repeatActor) {
            return send(
              { type: 'REPEAT_SELECTED_AYAH', ayahNumber: event.ayahNumber },
              { to: context.repeatActor.id },
            );
          }
          return [];
        }),
        exitRadio: pure((context) => {
          const { radioActor } = context;
          let actions = [];
          if (radioActor) {
            actions = [
              // @ts-ignore
              stop(radioActor),
              assign({
                radioActor: () => null,
                shouldPlayFromRandomTimeStamp: () => false,
              }),
            ];
          }
          return actions;
        }),
        forwardEndedToRadioMachine: pure((context) => {
          let actions = [];
          const { radioActor } = context;
          if (radioActor) {
            actions = [
              assign({
                ayahNumber: 1,
              }),
              send(
                {
                  type: 'TRACK_ENDED',
                },
                {
                  // @ts-ignore
                  to: radioActor,
                },
              ),
            ];
          }
          return actions;
        }),
        setRadioStationDetails: assign({
          shouldPlayFromRandomTimeStamp: (context, event: any) =>
            event.shouldPlayFromRandomTimeStamp,
          reciterId: (context, event: any) => event.reciterId,
          surah: (context, event: any) => event.surah,
        }),
        decrementAyah: assign({
          ayahNumber: (context) => context.ayahNumber - 1,
        }),
        incrementAyah: assign({
          ayahNumber: (context) => context.ayahNumber + 1,
        }),
        setSurahAndResetAyahNumber: assign({
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          surah: (context, event) => event.surah,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ayahNumber: (context) => 1,
        }),
        setAyahNumber: assign({
          ayahNumber: (context, event) => event.ayahNumber,
        }),
        setSurahAndAyahNumbers: assign({
          surah: (context, event) => event.surah,
          ayahNumber: (context, event) => event.ayahNumber,
        }),
        setAudioRef: assign({
          audioPlayer: (context, event) => event.audioPlayerRef,
        }),
        setAudioData: assign({
          duration: (context, event: any) => {
            return milliSecondsToSeconds(event.data.duration);
          },
          audioData: (context, event: any) => event.data,
          surahVersesCount: (context, event: any) => event.data.verseTimings.length,
        }),
        setAudioPlayerSource: (context) => {
          const {
            audioData: { audioUrl },
          } = context;
          context.audioPlayer.src = audioUrl;
        },
        setAudioPlayerCurrentTime: (context) => {
          const {
            ayahNumber,
            audioData: { verseTimings },
            duration,
            shouldPlayFromRandomTimeStamp,
          } = context;
          if (shouldPlayFromRandomTimeStamp) {
            const randomTimestamp = random(0, duration);
            context.audioPlayer.currentTime = randomTimestamp;
          } else {
            const ayahTimestamps = verseTimings[ayahNumber - 1];
            const { timestampFrom } = ayahTimestamps;
            context.audioPlayer.currentTime = milliSecondsToSeconds(timestampFrom);
          }
        },
        resetElapsedTime: assign({
          elapsed: 0,
        }),
        updateDownloadProgress: assign({
          downloadProgress: (context, event) => event.timestamp,
        }),
        // @ts-ignore
        setElapsedTime: pure((context) => {
          const activeVerseTiming = getActiveVerseTiming(context);
          const ayahNumber = getActiveAyahNumber(activeVerseTiming);
          const wordLocation = getActiveWordLocation(
            activeVerseTiming,
            context.audioPlayer.currentTime * 1000,
          );
          return assign({
            elapsed: context.audioPlayer.currentTime,
            ayahNumber,
            wordLocation,
          });
        }),
        setReciterId: assign({
          reciterId: (context, event) => event.reciterId,
        }),
        resetAyahNumber: assign({
          ayahNumber: 1,
        }),
        pauseAudio: (context) => {
          context.audioPlayer.pause();
        },
        setPlaybackRate: pure((context: AudioPlayerContext, event) => {
          const { playbackRate } = event;
          // eslint-disable-next-line no-param-reassign
          context.audioPlayer.playbackRate = playbackRate;
          return assign({
            playbackRate,
          });
        }),
        updateTiming: pure((context) => {
          const actions = [];
          actions.push('setElapsedTime');
          if (context.repeatActor) {
            actions.push(
              send(
                {
                  type: 'TIMESTAMP_UPDATED',
                  timestamp: context.audioPlayer.currentTime * 1000,
                },
                { to: context.repeatActor.id },
              ),
            );
          }
          return actions;
        }),
        forwardPlayToRadioMachine: pure((context, event) => {
          const actions = [];
          let { radioActor } = context;
          // if the radioActor doesn't exist, spawn a new one
          if (!radioActor) {
            radioActor = spawn(createRadioMachine());
            actions.push(assign({ radioActor }));
          }
          actions.push(
            send(
              {
                type: 'PLAY_STATION',
                stationType: event.stationType,
                id: event.stationId,
              },
              {
                to: radioActor.id,
              },
            ),
          );
          return actions;
        }),
        forwardChangeReciterToRadioMachine: pure((context, event) => {
          const actions = [];
          let { radioActor } = context;
          // if the radioActor doesn't exist, spawn a new one
          if (!radioActor) {
            radioActor = spawn(createRadioMachine());
            actions.push(assign({ radioActor }));
          }
          actions.push(
            send(
              {
                type: 'PLAY_STATION',
                stationType: StationType.Reciter,
                id: event.reciterId,
              },
              {
                to: radioActor.id,
              },
            ),
          );
          return actions;
        }),
        stopRepeatActor: pure((context: any) => {
          if (context.repeatActor) {
            return [
              stop(context.repeatActor.id),
              assign({
                repeatActor: null,
              }),
            ];
          }
          return [];
        }),
        // @ts-ignore
        repeatNextAyah: pure((context) => [
          send({ type: 'REPEAT_NEXT_AYAH' }, { to: context.repeatActor.id }),
          'incrementAyah',
          'setAudioPlayerCurrentTime',
        ]),
        // @ts-ignore
        repeatPreviousAyah: pure((context) => {
          if (context.repeatActor) {
            return [
              send({ type: 'REPEAT_PREV_AYAH' }, { to: context.repeatActor.id }),
              'decrementAyah',
              'setAudioPlayerCurrentTime',
            ];
          }
          return [];
        }),
        updateRepeatVerseTimings: pure((context) => {
          const actions = [];
          if (context.repeatActor) {
            actions.push(
              send(
                {
                  type: 'UPDATE_VERSE_TIMINGS',
                  verseTimings: context.audioData.verseTimings,
                },
                { to: context.repeatActor.id },
              ),
            );
          }
          return actions;
        }),
        nextAudioTrack: pure((context) => {
          if (context.radioActor) {
            return send({ type: 'TRACK_ENDED' }, { to: context.radioActor.id });
          }
          return [];
        }),
        seekTo: pure((context, event) => {
          // eslint-disable-next-line no-param-reassign
          context.audioPlayer.currentTime = event.timestamp;
          return assign({
            elapsed: event.timestamp,
          });
        }),
        seekToAndRepeat: pure((context, event) => {
          const actions = [];

          const ayahNumber = getAyahNumberByTimestamp(
            context.audioData.verseTimings,
            secondsToMilliSeconds(event.timestamp),
          );
          if (context.repeatActor) {
            actions.push(
              send({ type: 'REPEAT_SELECTED_AYAH', ayahNumber }, { to: context.repeatActor.id }),
            );
          }

          actions.push('seekTo');

          return actions;
        }),
        updateVolume: pure((context, { volume }) => {
          context.audioPlayer.volume = volume;
          return assign({ volume });
        }),
      },
      guards: {
        isRadioActive: (context) => !!context.radioActor,
        isNotLastVerse: (context) => context.ayahNumber < context.surahVersesCount,
        isNotFirstVerse: (context) => context.ayahNumber !== 1,
        canRepeatPrevAyah: (context) => context.ayahNumber !== 1 && !!context.repeatActor,
        canRepeatNextAyah: (context) =>
          context.ayahNumber < context.surahVersesCount && !!context.repeatActor,
        isDifferentSurah: (context, event) => context.surah !== event.surah,
        isDifferentSurahAndReciter: (context, event) => {
          const reciterId = event.reciterId || context.reciterId;
          return context.surah !== event.surah && reciterId !== context.audioData?.reciterId;
        },
        isSameAyah: (context, event) =>
          context.ayahNumber === event.ayahNumber && context.surah === event.surah,
        isSameSurahAndReciter: (context, event) => {
          // @ts-ignore
          const reciterId = event.reciterId || context.reciterId;
          return context.surah === event.surah && reciterId === context.audioData?.reciterId;
        },
        isRepeatActive: (context) => !!context.repeatActor,
        isUsingCustomReciterId: (context, event) => !!event.reciterId,
        isAudioAlmostEnded: (context) => {
          const { currentTime } = context.audioPlayer;
          const duration = milliSecondsToSeconds(context.audioData.duration);
          const durationWithTolerancePeriod = duration - 3;

          return currentTime > durationWithTolerancePeriod;
        },
      },
      services: {
        playAudio: (context) => {
          context.audioPlayer.playbackRate = context.playbackRate;
          context.audioPlayer.volume = context.volume;
          return context.audioPlayer.play();
        },
        fetchReciter: (context) => executeFetchReciter(context),
        fetchCustomReciter: (context, event) => {
          // @ts-ignore
          return executeFetchReciter({ surah: event.surah, reciterId: event.reciterId });
        },
        fetchRepeatData: (context, event) => executeFetchReciterFromEvent(context, event),
        // eslint-disable-next-line react-func/max-lines-per-function
        initMediaSession: (context) => (callback) => {
          if ('mediaSession' in navigator) {
            getRecitersList(context).then((recitersList) => {
              callback({ type: 'SET_RECITERS_LIST', recitersList });
              getMediaSessionMetaData(context, recitersList).then((metaData) => {
                navigator.mediaSession.metadata = metaData;
              });
            });
          }

          const actionHandlers = [
            ['play', () => callback('TOGGLE')],
            ['pause', () => callback('TOGGLE')],
            [
              'previoustrack',
              () => {
                if (context.radioActor) {
                  callback('NEXT_AUDIO_TRACK');
                }
                callback('PREV_AYAH');
              },
            ],
            [
              'nexttrack',
              () => {
                if (context.radioActor) {
                  callback('NEXT_AUDIO_TRACK');
                }
                callback('NEXT_AYAH');
              },
            ],
            [
              'stop',
              () => {
                callback('END');
              },
            ],
          ];

          for (const [action, handler] of actionHandlers) {
            try {
              navigator.mediaSession.setActionHandler(
                action as MediaSessionAction,
                handler as MediaSessionActionHandler,
              );
            } catch (error) {
              // eslint-disable-next-line no-console
              console.log(`The media session action "${action}" is not supported yet.`);
            }
          }
        },
      },
      delays: {
        VERSE_DELAY: (context) => {
          return context.verseDelay;
        },
      },
    },
  );
