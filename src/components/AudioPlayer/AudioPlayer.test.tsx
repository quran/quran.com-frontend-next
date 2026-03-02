import React from 'react';

import { cleanup, render, fireEvent } from '@testing-library/react';
import { afterEach, describe, it, expect, vi } from 'vitest';

import AudioPlayer from './AudioPlayer';

import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

vi.mock('next/dynamic', () => ({
  default: () => {
    const Stub = () => <div data-testid="audio-player-body-stub" />;
    return Stub;
  },
}));

vi.mock('@/components/Onboarding/OnboardingProvider', () => ({
  useOnboarding: () => ({ isActive: false }),
}));

vi.mock('react-redux', () => ({
  useSelector: () => false,
}));

vi.mock('@xstate/react', () => ({
  useSelector: (service: unknown, selector: (state: unknown) => unknown) => {
    return selector({ matches: (val: string) => val === 'VISIBLE' });
  },
}));

vi.mock('@/utils/datetime', () => ({
  milliSecondsToSeconds: (ms: number) => ms / 1000,
}));

interface MockSnapshot {
  matches: (stateValue: string) => boolean;
  context?: {
    audioData?: { duration: number } | null;
  };
}

const createMockAudioService = (statePath: string) => {
  const send = vi.fn();
  const getSnapshot = (): MockSnapshot => ({
    matches: (val: string) => val === statePath,
    context: { audioData: { duration: 10_000 } },
  });
  return {
    send,
    getSnapshot,
    state: {
      hasTag: () => false,
    },
  };
};

describe('AudioPlayer', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  const renderWithService = (audioService: ReturnType<typeof createMockAudioService>) => {
    const result = render(
      <AudioPlayerMachineContext.Provider
        value={audioService as unknown as React.ContextType<typeof AudioPlayerMachineContext>}
      >
        <AudioPlayer />
      </AudioPlayerMachineContext.Provider>,
    );
    audioService.send.mockClear();
    return result;
  };

  describe('onPlay guard', () => {
    it('pauses audio and does not send PLAY when machine is not in PLAYING state', () => {
      const audioService = createMockAudioService('VISIBLE.AUDIO_PLAYER_INITIATED.PAUSED.ACTIVE');
      renderWithService(audioService);

      const audioEl = document.getElementById('audio-player') as HTMLAudioElement;
      const pauseSpy = vi.fn();
      audioEl.pause = pauseSpy;

      fireEvent.play(audioEl);

      expect(pauseSpy).toHaveBeenCalled();
      expect(audioService.send).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'PLAY' }));
    });

    it('sends PLAY when machine is in PLAYING state', () => {
      const audioService = createMockAudioService('VISIBLE.AUDIO_PLAYER_INITIATED.PLAYING');
      renderWithService(audioService);

      const audioEl = document.getElementById('audio-player') as HTMLAudioElement;
      fireEvent.play(audioEl);

      expect(audioService.send).toHaveBeenCalledWith({ type: 'PLAY' });
    });
  });

  describe('onTimeUpdate guard', () => {
    it('does not send WAITING or CAN_PLAY when machine is not in PLAYING state', () => {
      const audioService = createMockAudioService('VISIBLE.AUDIO_PLAYER_INITIATED.PAUSED.ACTIVE');
      renderWithService(audioService);

      const audioEl = document.getElementById('audio-player') as HTMLAudioElement;
      Object.defineProperty(audioEl, 'currentTime', { value: 3, writable: true });
      Object.defineProperty(audioEl, 'buffered', {
        value: { length: 1, end: () => 2 },
        writable: true,
      });

      fireEvent.timeUpdate(audioEl);

      expect(audioService.send).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: 'WAITING' }),
      );
      expect(audioService.send).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: 'CAN_PLAY' }),
      );
      expect(audioService.send).toHaveBeenCalledWith({ type: 'UPDATE_TIMING' });
    });
  });
});
