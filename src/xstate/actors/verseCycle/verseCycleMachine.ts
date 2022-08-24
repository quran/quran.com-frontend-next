/* eslint-disable jsdoc/check-tag-names */
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable import/prefer-default-export */
import { assign, createMachine } from 'xstate';
import { pure, sendParent } from 'xstate/lib/actions';

export const createVerseCycleMachine = ({ timestampFrom, timestampTo, totalVerseCycle }) =>
  /** @xstate-layout N4IgpgJg5mDOIC5QDcwCdZgMIE8DGANmAIJ4AuA9mgHQCWAdgApoVRpywDEAqowCLEAKgFEA+oICSAWQkA5AOKJQABwqxaZWhXpKQAD0QBaAEwB2AJzULxgCznjAZgAMTgBxOLAGhA5EAVktzIKDXP2MARlsbJ3CAX1jvVAxsfCJSShokzGF6CEhOXVV1TW1dAwRwu2oANjdq8PqG41dmh29fBAdTcOpzU1C3G1dw8OdHeISQego8+CQQLJTCEnIqOiYWNg5CtQ0tHXnyw2qHG2obRwdRroHzNp9-B2o-Fxs32vDTCxtq+MT0TC4ZbpNaLHJ5CA7Yr7MqIYxuaiuIYudzhO7mEbtRDhJx+c6uaqmALdGxo0nmP4LAFLNKrGgAMwYtFgAAtIFC9qVDtiHK5eqY7Gi3F9og4-FiEPY+aYImZqh9zNU-KZKYsgbSMhySgdQEclXyLg4rkb+i87hLDGj8S8PFdXATusZfhMgA */
  createMachine(
    {
      context: {
        timestampFrom,
        timestampTo,
        totalVerseCycle,
        currentVerseCycle: 1,
      },
      tsTypes: {} as import('./verseCycleMachine.typegen').Typegen0,
      id: 'verseCycleActor',
      initial: 'inProgress',
      states: {
        inProgress: {
          on: {
            UPDATE_VERSE_TIMING: {
              actions: 'updateVerseTiming',
            },
            TIMESTAMP_UPDATED: {
              cond: 'verseEnded',
              target: 'verseEnded',
            },
          },
        },
        verseEnded: {
          always: [
            {
              actions: 'repeatSameAyah',
              description: 'Inc context.currentVerseCycleNumber and sendParent(REPEAT_SAME_AYAH)',
              cond: 'verseRepeatOnProgress',
              target: 'inProgress',
            },
            {
              description: 'When repeat cycle is done, transition to finished state',
              target: 'finished',
            },
          ],
        },
        finished: {
          entry: 'sendVerseRepeatFinished',
          description: 'Send VERSE_REPEAT_FINISHED event',
          type: 'final',
        },
      },
    },
    {
      guards: {
        verseEnded: (context, event: { timestamp: number }) => {
          return (
            event.timestamp >= context.timestampTo - 200 // 200ms is a buffer for the verse end time
            // TODO: discuss this
          );
        },
        verseRepeatOnProgress: (context) => {
          return context.currentVerseCycle < context.totalVerseCycle;
        },
      },
      actions: {
        updateVerseTiming: pure((context, event: any) => {
          return assign({
            timestampFrom: event.timestampFrom,
            timestampTo: event.timestampTo,
          });
        }),
        sendVerseRepeatFinished: sendParent(() => {
          return {
            type: 'VERSE_REPEAT_FINISHED',
          };
        }),
        repeatSameAyah: pure((context) => {
          return [
            assign({
              currentVerseCycle: context.currentVerseCycle + 1,
            }),
            sendParent({
              type: 'REPEAT_SAME_AYAH',
            }),
          ];
        }),
      },
    },
  );
