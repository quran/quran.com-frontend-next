/* eslint-disable import/prefer-default-export */
import { createContext, useEffect } from 'react';

import { useInterpret } from '@xstate/react';
import { InterpreterFrom } from 'xstate';

import { audioPlayerMachine } from './actors/audioPlayer/audioPlayerMachine';
import {
  getXstateStateFromLocalStorage,
  persistXstateToLocalStorage,
} from './actors/audioPlayer/audioPlayerPersistHelper';

import { getAudioPlayerStateInitialState } from 'src/redux/defaultSettings/util';
import { getUserPreferences } from 'src/utils/auth/api';
import { isLoggedIn } from 'src/utils/auth/login';
import PreferenceGroup from 'types/auth/PreferenceGroup';

export const AudioPlayerMachineContext = createContext(
  {} as InterpreterFrom<typeof audioPlayerMachine>,
);

const LOCAL_STORAGE_PERSISTENCE_EVENT_TRIGGER = ['CHANGE_RECITER', 'SET_PLAYBACK_SPEED'];

export const AudioPlayerMachineProvider = ({ children, locale }) => {
  const initialXstateContext = getXstateStateFromLocalStorage();
  const defaultAudioStateByLocale = getAudioPlayerStateInitialState(locale);
  const defaultLocaleContext = {
    reciterId: defaultAudioStateByLocale.reciter.id,
  };

  const isClient = !!(
    typeof window !== 'undefined' &&
    window.document &&
    window.document.createElement
  );

  const loggedIn = isLoggedIn();

  const audioPlayerService = useInterpret(
    audioPlayerMachine,
    {
      context: {
        ...audioPlayerMachine.initialState.context,
        ...defaultLocaleContext,
        ...initialXstateContext,
      },
    },
    (state) => {
      const { playbackRate, reciterId } = state.context;
      if (LOCAL_STORAGE_PERSISTENCE_EVENT_TRIGGER.includes(state.event.type)) {
        persistXstateToLocalStorage({ playbackRate, reciterId });
      }
    },
  );

  useEffect(() => {
    if (isClient && loggedIn) {
      getUserPreferences(locale).then((preferences) => {
        const playbackRate =
          preferences[PreferenceGroup.AUDIO]?.playbackRate ||
          audioPlayerMachine.initialState.context.playbackRate;

        const reciterId =
          preferences[PreferenceGroup.AUDIO]?.reciter?.id ||
          audioPlayerMachine.initialState.context.reciterId;

        audioPlayerService.send({ type: 'SET_INITIAL_CONTEXT', playbackRate, reciterId });
      });
    }
  }, [audioPlayerService, isClient, locale, loggedIn]);

  return (
    <AudioPlayerMachineContext.Provider value={audioPlayerService}>
      {children}
    </AudioPlayerMachineContext.Provider>
  );
};
