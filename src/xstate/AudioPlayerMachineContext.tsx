/* eslint-disable import/prefer-default-export */
import { createContext } from 'react';

import { useInterpret } from '@xstate/react';
import { InterpreterFrom } from 'xstate';

import { audioPlayerMachine } from './actors/audioPlayer/audioPlayerMachine';
import {
  getXstateStateFromLocalStorage,
  persistXstateToLocalStorage,
} from './actors/audioPlayer/audioPlayerPersistHelper';

export const AudioPlayerMachineContext = createContext(
  {} as InterpreterFrom<typeof audioPlayerMachine>,
);

export const AudioPlayerMachineProvider = ({ children }) => {
  const initialXstateContext = getXstateStateFromLocalStorage();

  const audioPlayerService = useInterpret(
    audioPlayerMachine,
    {
      context: {
        ...audioPlayerMachine.initialState.context,
        ...initialXstateContext,
      },
    },
    (state) => {
      const { playbackRate, reciterId } = state.context;
      persistXstateToLocalStorage({ playbackRate, reciterId });
    },
  );

  return (
    <AudioPlayerMachineContext.Provider value={audioPlayerService}>
      {children}
    </AudioPlayerMachineContext.Provider>
  );
};
