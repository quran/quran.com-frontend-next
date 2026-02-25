import React from 'react';

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { afterEach, describe, it, expect, vi } from 'vitest';

import ResetButton from './ResetButton';

import { DEFAULT_XSTATE_INITIAL_STATE } from '@/redux/defaultSettings/defaultSettings';
import { isLoggedIn } from '@/utils/auth/login';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

vi.mock('next/router', () => ({
  useRouter: () => ({
    query: {},
    push: vi.fn(),
  }),
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string) => key,
    lang: 'en',
  }),
}));

vi.mock('react-redux', () => ({
  useDispatch: vi.fn(),
}));

vi.mock('@/utils/auth/login', () => ({
  isLoggedIn: vi.fn(() => false),
}));

vi.mock('@/utils/eventLogger', () => ({
  logButtonClick: vi.fn(),
}));

vi.mock('@/dls/Toast/Toast', () => ({
  ToastStatus: { Success: 'success', Error: 'error' },
  useToast: () => vi.fn(),
}));

const NON_DEFAULT_RECITER_ID = 11;

interface MockAudioService {
  send: ReturnType<typeof vi.fn>;
  getSnapshot: () => {
    context: {
      reciterId: number;
      audioData?: { reciterId: number } | null;
    };
  };
}

describe('ResetButton', () => {
  const dispatchMock = vi.fn(() => Promise.resolve({ payload: undefined }));

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  const renderButton = (audioContext: MockAudioService) =>
    render(
      <AudioPlayerMachineContext.Provider
        value={audioContext as unknown as React.ContextType<typeof AudioPlayerMachineContext>}
      >
        <ResetButton />
      </AudioPlayerMachineContext.Provider>,
    );

  const createAudioContext = (
    audioDataReciterId?: number | null,
    contextReciterId = DEFAULT_XSTATE_INITIAL_STATE.reciterId,
  ): MockAudioService => {
    const send = vi.fn();
    return {
      send,
      getSnapshot: () => ({
        context: {
          reciterId: contextReciterId,
          audioData:
            audioDataReciterId === null || audioDataReciterId === undefined
              ? (audioDataReciterId as null | undefined)
              : { reciterId: audioDataReciterId },
        },
      }),
    };
  };

  it('sends CHANGE_RECITER when currently loaded audio reciter differs from default', () => {
    vi.mocked(useDispatch).mockReturnValue(dispatchMock);
    const audioContext = createAudioContext(NON_DEFAULT_RECITER_ID);

    renderButton(audioContext);
    fireEvent.click(screen.getByTestId('reset-settings-button'));

    expect(dispatchMock).toHaveBeenCalled();
    expect(audioContext.send).toHaveBeenCalledWith({
      type: 'SET_INITIAL_CONTEXT',
      ...DEFAULT_XSTATE_INITIAL_STATE,
    });
    expect(audioContext.send).toHaveBeenCalledWith({
      type: 'CHANGE_RECITER',
      reciterId: DEFAULT_XSTATE_INITIAL_STATE.reciterId,
    });
  });

  it('does not send CHANGE_RECITER when active reciter is already default', () => {
    vi.mocked(useDispatch).mockReturnValue(dispatchMock);
    const audioContext = createAudioContext(DEFAULT_XSTATE_INITIAL_STATE.reciterId);

    renderButton(audioContext);
    fireEvent.click(screen.getByTestId('reset-settings-button'));

    expect(dispatchMock).toHaveBeenCalled();
    expect(audioContext.send).toHaveBeenCalledWith({
      type: 'SET_INITIAL_CONTEXT',
      ...DEFAULT_XSTATE_INITIAL_STATE,
    });
    expect(audioContext.send).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: 'CHANGE_RECITER' }),
    );
  });

  it('falls back to context.reciterId when audioData is null', () => {
    vi.mocked(useDispatch).mockReturnValue(dispatchMock);
    const audioContext = createAudioContext(null, DEFAULT_XSTATE_INITIAL_STATE.reciterId);

    renderButton(audioContext);
    fireEvent.click(screen.getByTestId('reset-settings-button'));

    expect(audioContext.send).toHaveBeenCalledWith({
      type: 'SET_INITIAL_CONTEXT',
      ...DEFAULT_XSTATE_INITIAL_STATE,
    });
    expect(audioContext.send).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: 'CHANGE_RECITER' }),
    );
  });

  it('sends CHANGE_RECITER when audioData is null and context reciter differs from default', () => {
    vi.mocked(useDispatch).mockReturnValue(dispatchMock);
    const audioContext = createAudioContext(null, NON_DEFAULT_RECITER_ID);

    renderButton(audioContext);
    fireEvent.click(screen.getByTestId('reset-settings-button'));

    expect(audioContext.send).toHaveBeenCalledWith({
      type: 'CHANGE_RECITER',
      reciterId: DEFAULT_XSTATE_INITIAL_STATE.reciterId,
    });
  });

  it('resets settings for logged-in users after persisting defaults', async () => {
    vi.mocked(useDispatch).mockReturnValue(dispatchMock);
    vi.mocked(isLoggedIn).mockReturnValue(true);
    const audioContext = createAudioContext(NON_DEFAULT_RECITER_ID);

    renderButton(audioContext);
    fireEvent.click(screen.getByTestId('reset-settings-button'));

    await waitFor(() => {
      expect(audioContext.send).toHaveBeenCalledWith({
        type: 'SET_INITIAL_CONTEXT',
        ...DEFAULT_XSTATE_INITIAL_STATE,
      });
    });
  });
});
