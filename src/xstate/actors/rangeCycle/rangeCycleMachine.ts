/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable jsdoc/check-tag-names */
/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable import/prefer-default-export */
import { createMachine, ActorRefFrom, spawn } from 'xstate';
import { forwardTo, pure, sendParent, stop, assign, send } from 'xstate/lib/actions';

import { createVerseCycleMachine } from '../verseCycle/verseCycleMachine';

import VerseTiming from 'types/VerseTiming';

export const createRangeCycleMachine = ({
  totalRangeCycle,
  totalVerseCycle,
  verseTimings,
  fromVerseNumber,
  toVerseNumber,
}) =>
  /** @xstate-layout N4IgpgJg5mDOIC5QCcCGA7GBhAngYwBswBBPAFwHtkA6AS3QAVkKpk5YBiAFQEkBZAKIBlLsT4MA+gFUGAEWJcBsxKAAOFWLTK0K6FSAAeiAGwB2AIzUALACZTAVnMAOZ1fsAGYwBoQORI+pjAGYnKwBOELdw+2NjAF84nzRMMFxCEnIqOkZmVnYOACUBBgEFCSExAQliAE1iAAl9dU1tXX0jBCszajCnd3cnIKtPczDzUysfPwQAWnGransxoLD3GydTTatxhKSMbHwiUkoaeiYWNlhOIpKygDkBAA0uarrGpBBmrR09D46YsLUCY2MZhexDGz2KxOKaIWyWcxQjaOdzbIJBey7EDJA7pY5ZM65S7XYqlF4MIoANVeDSaGm+bT+-mMgOBoPBtiRsIQQVMQWoiOhDnMqPM6MxiWx+1ShwyJ2y5zyVw4lIEBSEVRuZIkADEeHceEJ6ko6S0fu1EDMbCyBcEgu4xZs7PZuXN3IFrWZwqZUT6nMYbFicTK8ZkaMGBOgIJAOKaGb9QB0hvyHGEbNb7FD3B5Jr44TbBciRWiMQlJegKNH4B9g2kjmGFUT2HHWgnDIh1gtzFYgnYwsZtmYzNzTE5Ar2QRYwtEVk4g9K63KshGo5AW+ambMMQswhFeQN+k5kdyzGPjODwTYMU4bOZ5ylF-iaAAzei0WAACzXHy+rYtW+zRZwhZUxgncXsb25MFLD6exIWCMUYicMJ71xesTnXRlE0tXkx13dE-UPY881mGwrFMRZQNCOw3HMMj1jLOIgA */
  createMachine(
    {
      context: {
        verseCycleActor: null as ActorRefFrom<ReturnType<typeof createVerseCycleMachine>>,
        totalVerseCycle,
        totalRangeCycle,
        currentRangeCycle: 1,
        fromVerseNumber,
        toVerseNumber,
        currentVerseNumber: fromVerseNumber,
        verseTimings: verseTimings as VerseTiming[],
      },
      tsTypes: {} as import('./rangeCycleMachine.typegen').Typegen0,
      id: 'rangeCycleActor',
      initial: 'inProgress',
      states: {
        inProgress: {
          entry: 'spawnVerseCycleActor',
          on: {
            UPDATE_VERSE_TIMINGS: {
              actions: 'updateVerseTimings',
            },
            TIMESTAMP_UPDATED: {
              actions: 'forwardtimestampToVerseActor',
              description:
                'Receive TIMESTAMP_UPDATED event from parent. Forward to verseCycleActor',
            },
            REPEAT_SAME_AYAH: {
              actions: 'repeatSameAyah',
              description: 'Event from verseCycleActor. forward sendParent(REPEAT_SAME_AYAH)',
            },
            REPEAT_NEXT_AYAH: {
              actions: 'repeatNextAyah',
            },
            REPEAT_PREV_AYAH: {
              actions: 'repeatPreviousAyah',
            },
            REPEAT_SELECTED_AYAH: {
              actions: 'repeatSelectedAyah',
            },
            VERSE_REPEAT_FINISHED: [
              {
                cond: 'rangeEnded',
                target: 'rangeEnded',
              },
              {
                actions: 'spawnNextAyahActor',
              },
            ],
          },
        },
        rangeEnded: {
          description:
            'State where we reached the end of the range. Deciding whether to repeat or finish',
          always: [
            {
              actions: 'repeatCycle',
              description:
                'When range cycle is not finished yet. Inc context.currentRangeCycle, respawn verseCycleActor and sendPlayFromAyah',
              cond: 'rangeCycleOnProgress',
              target: 'inProgress',
            },
            {
              description: 'When range cycle is finished, transition to finished state',
              cond: 'rangeCycleFinished',
              target: 'finished',
            },
          ],
        },
        finished: {
          entry: 'sendRangeRepeatFinished',
          description: 'Send RANGE_REPEAT_FINISHED to parent',
          type: 'final',
        },
      },
    },
    {
      guards: {
        rangeEnded: (context) => {
          return context.currentVerseNumber === toVerseNumber;
        },
        rangeCycleOnProgress: (context) => {
          return context.currentRangeCycle < context.totalRangeCycle;
        },
        rangeCycleFinished: (context) => {
          return context.currentRangeCycle >= context.totalRangeCycle;
        },
      },
      actions: {
        repeatSelectedAyah: pure((context, event: any) => {
          const { ayahNumber } = event;
          const selectedVerseTiming: VerseTiming = context.verseTimings[ayahNumber - 1];

          return [
            stop(context.verseCycleActor.id),
            assign({
              currentVerseNumber: ayahNumber,
              verseCycleActor: spawn(
                createVerseCycleMachine({
                  timestampFrom: selectedVerseTiming.timestampFrom,
                  timestampTo: selectedVerseTiming.timestampTo,
                  totalVerseCycle: context.totalVerseCycle,
                }),
              ),
            }),
          ];
        }),
        // @ts-ignore
        updateVerseTimings: pure((context, event: any) => {
          const curentVerseTiming = event.verseTimings[context.currentVerseNumber - 1];
          return [
            assign({
              verseTimings: event.verseTimings,
            }),
            send(
              {
                type: 'UPDATE_VERSE_TIMING',
                timestampFrom: curentVerseTiming.timestampFrom,
                timestampTo: curentVerseTiming.timestampTo,
              },
              {
                to: context.verseCycleActor.id,
              },
            ),
          ];
        }),
        repeatNextAyah: pure((context) => {
          const currentIndex = context.currentVerseNumber - 1;
          const nextVerseTiming: VerseTiming = context.verseTimings[currentIndex + 1];
          const nextVerseNumber = context.currentVerseNumber + 1;

          if (nextVerseNumber > toVerseNumber) {
            return [
              stop(context.verseCycleActor.id),
              sendParent({ type: 'RANGE_REPEAT_FINISHED' }),
            ];
          }

          return [
            stop(context.verseCycleActor.id),
            assign({
              currentVerseNumber: nextVerseNumber,
              verseCycleActor: spawn(
                createVerseCycleMachine({
                  timestampFrom: nextVerseTiming.timestampFrom,
                  timestampTo: nextVerseTiming.timestampTo,
                  totalVerseCycle: context.totalVerseCycle,
                }),
              ),
            }),
          ];
        }),
        repeatPreviousAyah: pure((context) => {
          const currentIndex = context.currentVerseNumber - 1;
          const prevVerseTiming: VerseTiming = context.verseTimings[currentIndex - 1];
          const prevVerseNumber = context.currentVerseNumber - 1;

          return [
            stop(context.verseCycleActor.id),
            assign({
              currentVerseNumber: prevVerseNumber,
              verseCycleActor: spawn(
                createVerseCycleMachine({
                  timestampFrom: prevVerseTiming.timestampFrom,
                  timestampTo: prevVerseTiming.timestampTo,
                  totalVerseCycle: context.totalVerseCycle,
                }),
              ),
            }),
          ];
        }),
        spawnNextAyahActor: pure((context) => {
          const currentIndex = context.currentVerseNumber - 1;
          const currentVerseTiming: VerseTiming = context.verseTimings[currentIndex];
          const nextVerseTiming: VerseTiming = context.verseTimings[currentIndex + 1];

          const nextVerseNumber = context.currentVerseNumber + 1;
          const previousVerseDuration = Math.abs(currentVerseTiming.duration);

          return [
            stop(context.verseCycleActor.id),
            sendParent({
              type: 'REPEAT_AYAH',
              verseNumber: nextVerseNumber,
              verseDuration: previousVerseDuration,
            }),
            assign({
              verseCycleActor: spawn(
                createVerseCycleMachine({
                  timestampFrom: nextVerseTiming.timestampFrom,
                  timestampTo: nextVerseTiming.timestampTo,
                  totalVerseCycle: context.totalVerseCycle,
                }),
              ),
              currentVerseNumber: nextVerseNumber,
            }),
          ];
        }),
        /**
         * forward TIMESTAMP_UPDATED event to verseCycleActor
         */
        forwardtimestampToVerseActor: forwardTo((context) => {
          return context.verseCycleActor;
        }),

        /**
         * Forward the event to parent
         */
        repeatSameAyah: sendParent((context) => {
          const verseTiming = context.verseTimings[context.currentVerseNumber - 1];
          const verseDuration = verseTiming.duration;
          return { type: 'REPEAT_AYAH', verseNumber: context.currentVerseNumber, verseDuration };
        }),

        /**
         * Repeat Cycle
         * - Increment currentRangeCycle
         * - respawn verseCycleActor
         * - send to parent PLAY_FROM_AYAH
         */
        repeatCycle: pure((context) => {
          const verseTiming = context.verseTimings[fromVerseNumber - 1];
          const verseDuration = verseTiming.duration;
          return [
            stop(context.verseCycleActor.id), // stop verseCycleActor
            assign({
              currentRangeCycle: context.currentRangeCycle + 1,
              verseCycleActor: spawn(
                createVerseCycleMachine({
                  timestampFrom: verseTiming.timestampFrom,
                  timestampTo: verseTiming.timestampTo,
                  totalVerseCycle: context.totalVerseCycle,
                }),
              ),
              currentVerseNumber: fromVerseNumber,
            }),
            sendParent({
              type: 'REPEAT_AYAH',
              verseNumber: context.fromVerseNumber,
              verseDuration,
            }),
          ];
        }),

        sendRangeRepeatFinished: pure(() => {
          return sendParent({ type: 'RANGE_REPEAT_FINISHED' });
        }),

        /**
         * Spawn verseCycleActor, and assign it to context
         */
        spawnVerseCycleActor: assign({
          verseCycleActor: (context) => {
            const curentVerseTiming = context.verseTimings[context.currentVerseNumber - 1];
            return spawn(
              createVerseCycleMachine({
                timestampFrom: curentVerseTiming.timestampFrom,
                timestampTo: curentVerseTiming.timestampTo,
                totalVerseCycle: context.totalVerseCycle,
              }),
            );
          },
        }),
      },
    },
  );
