/* eslint-disable react-func/max-lines-per-function */
import { assign, createMachine, sendParent } from 'xstate';

const repeatMachine = () =>
  createMachine(
    {
      id: 'id',
      context: {
        verseDuration: 0,
        repeatSettings: {
          delayMultiplier: 0,
          repeatVerseCount: 0,
          repeatRangeCount: 0,
          repeatRangeFrom: null,
          repeatRangeTo: null,
        },
        repeatProgress: {
          repeatRangeCount: 0,
          repeatVerseCount: 0,
        },
      },
      states: {
        repeatingVerse: {
          on: {
            VERSE_ENDED: [
              {
                cond: 'repeatVerseProgressDone',
                target: 'delaying',
                actions: ['pause', 'updateContextOnVerseEnded', sendParent('REQUEST_PREV_VERSE')],
              },
              { cond: 'repeatRangeProgressDone', actions: [sendParent('REPEAT_DONE')] },
            ],
          },
        },
        delaying: {
          after: {
            VERSE_DURATION: 'repeatingVerse',
          },
        },
      },
    },
    {
      guards: {
        repeatVerseProgressDone: () => {
          return true;
        },
        repeatVerseProgressDoneButRepeatRangeNotDone: (context, event) => {
          return true;
        },
        repeatRangeProgressDone: () => {
          return true;
        },
      },
      actions: {
        pause: sendParent('PAUSE'),
        updateContextOnVerseEnded: assign({
          repeatProgress: (context, event) => {
            let nextVerseRepeatCount = context.repeatProgress.repeatVerseCount + 1;
            const nextRangeRepeatCount = context.repeatProgress.repeatRangeCount;

            // verseDuration = event.verseDuration
            //

            if (nextVerseRepeatCount > context.repeatSettings.repeatVerseCount) {
              //   nextRangeRepeatCount += 1;
              nextVerseRepeatCount = 1;
            }

            // onRangeEnded , VERSE_ENDED need to send verseDuration, and verseNumber

            // const nextRepeatRangeCount = context.repeatProgress.repeatRangeCount + 1;
            // const nextRepeatVerseCount = context.repeatProgress.repeatVerseCount + 1;

            return {
              repeatRangeCount: nextRangeRepeatCount,
              repeatVerseCount: nextVerseRepeatCount,
            };
          },
        }),
      },
      delays: {
        DYNAMIC_DELAY: (context) => {
          return context.verseDuration * context.repeatSettings.delayMultiplier;
        },
      },
    },
  );

export default repeatMachine;
