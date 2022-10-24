/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable import/prefer-default-export */
import random from 'lodash/random';
import sample from 'lodash/sample';
import { assign, createMachine } from 'xstate';
import { sendParent } from 'xstate/lib/actions';

import RadioContext from './types/RadioContext';
import RadioEventType from './types/RadioEventType';

import curatedStations from '@/components/Radio/curatedStations';
import { AudioTrack, StationType } from '@/components/Radio/types';

export const createRadioMachine = () => {
  return createMachine(
    {
      tsTypes: {} as import('./radioMachine.typegen').Typegen0,
      schema: {
        context: {} as RadioContext,
        events: {} as RadioEventType,
      },
      id: 'radioMachine',
      initial: 'on',
      context: {
        type: StationType.Curated,
      },
      states: {
        on: {
          on: {
            PLAY_STATION: {
              actions: ['setStation', 'generateRadioAudioTrack'],
            },
            TRACK_ENDED: {
              actions: 'generateNextAudioTrack',
            },
          },
        },
      },
    },
    {
      actions: {
        setStation: assign({
          type: (context, event) => event.stationType,
          id: (context, event) => event.id,
        }),
        generateNextAudioTrack: sendParent((context) => {
          const { type, id } = context;
          let randomAudioTrack: AudioTrack;
          if (type === StationType.Curated) {
            const station = curatedStations[id];
            randomAudioTrack = sample(station.audioTracks);
          } else {
            randomAudioTrack = {
              reciterId: id,
              surah: random(1, 114).toString(),
            };
          }
          return {
            type: 'PLAY_RADIO_TRACK',
            shouldPlayFromRandomTimeStamp: false,
            reciterId: Number(randomAudioTrack.reciterId),
            surah: Number(randomAudioTrack.surah),
          };
        }),
        generateRadioAudioTrack: sendParent((context, event) => {
          const { stationType, id } = event;
          let randomAudioTrack: AudioTrack;
          if (stationType === StationType.Curated) {
            const station = curatedStations[id];
            randomAudioTrack = sample(station.audioTracks);
          } else {
            randomAudioTrack = {
              reciterId: id,
              surah: random(1, 114).toString(),
            };
          }
          return {
            type: 'PLAY_RADIO_TRACK',
            shouldPlayFromRandomTimeStamp: true,
            reciterId: Number(randomAudioTrack.reciterId),
            surah: Number(randomAudioTrack.surah),
          };
        }),
      },
    },
  );
};
