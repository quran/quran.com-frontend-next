import React, { useContext, useEffect } from 'react';

import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { persistXstateToLocalStorage } from './actors/audioPlayer/audioPlayerPersistHelper';
import { AudioPlayerMachineContext, AudioPlayerMachineProvider } from './AudioPlayerMachineContext';

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string) => key }),
}));

vi.mock('@/dls/Toast/Toast', () => ({
  ToastStatus: { Error: 'error' },
  useToast: () => vi.fn(),
}));

vi.mock('./actors/audioPlayer/audioPlayerPersistHelper', () => ({
  getXstateStateFromLocalStorage: () => ({}),
  persistXstateToLocalStorage: vi.fn(),
}));

const Probe = ({ eventOverride }: { eventOverride?: Record<string, unknown> }) => {
  const audioService = useContext(AudioPlayerMachineContext);

  useEffect(() => {
    audioService.send({
      type: 'SET_INITIAL_CONTEXT',
      reciterId: 7,
      playbackRate: 1,
      volume: 0.75,
      ...eventOverride,
    });
  }, [audioService, eventOverride]);

  return null;
};

describe('AudioPlayerMachineProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('persists xstate context when receiving SET_INITIAL_CONTEXT', async () => {
    render(
      <AudioPlayerMachineProvider>
        <Probe />
      </AudioPlayerMachineProvider>,
    );

    await waitFor(() => {
      expect(persistXstateToLocalStorage).toHaveBeenCalledWith({
        reciterId: 7,
        playbackRate: 1,
        volume: 0.75,
      });
    });
  });
});
