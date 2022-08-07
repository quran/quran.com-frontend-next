/* eslint-disable import/prefer-default-export */
import { createContext } from 'react';

import { InterpreterFrom } from 'xstate';

import { audioPlayerMachine } from './actors/audioPlayer/audioPlayerMachine';

export const AudioPlayerMachineContext = createContext(
  {} as InterpreterFrom<typeof audioPlayerMachine>,
);
