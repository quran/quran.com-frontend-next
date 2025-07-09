import { useContext } from 'react';
import type { MouseEvent } from 'react';

import { useRouter } from 'next/router';
import type { NextRouter } from 'next/router';
import { InterpreterFrom } from 'xstate';

import { isLoggedIn } from '@/utils/auth/login';
import { getLoginNavigationUrl, NavigationMethod } from '@/utils/navigation';
import { audioPlayerMachine } from '@/xstate/actors/audioPlayer/audioPlayerMachine';
import AudioPlayerEventType from '@/xstate/actors/audioPlayer/types/AudioPlayerEventType';
import { AudioPlayerMachineContext } from '@/xstate/AudioPlayerMachineContext';

/**
 * A custom hook to handle navigation with audio player closing for logged-out users.
 * This hook provides a consistent way to handle navigation across the application.
 *
 * @returns {NavigationHandlingResult} An object containing navigation utilities
 */

type NavigationHandler = (e?: MouseEvent) => void;

interface NavigationHandlingResult {
  navigateWithAudioHandling: (
    url: string,
    logButtonCallback?: () => void,
    method?: NavigationMethod,
  ) => NavigationHandler;
}
const useAudioNavigation = (): NavigationHandlingResult => {
  const router: NextRouter = useRouter();
  const audioPlayerService: InterpreterFrom<typeof audioPlayerMachine> =
    useContext(AudioPlayerMachineContext);

  /**
   * Navigate to a URL, closing the audio player first if the user is not logged in.
   *
   * @param {string} url The URL to navigate to if the user is logged in
   * @param {() => void} logButtonCallback Optional callback function to log button clicks
   * @param {NavigationMethod} method Navigation method to use (NavigationMethod.Push or NavigationMethod.Replace), defaults to NavigationMethod.Push
   * @returns {NavigationHandler} A function that can be used as an onClick handler
   */
  /**
   * Helper function to navigate using the specified method
   *
   * @param {string} targetUrl URL to navigate to
   * @param {NavigationMethod} navMethod Navigation method to use (NavigationMethod.Push or NavigationMethod.Replace)
   */
  const navigate = (targetUrl: string, navMethod: NavigationMethod): void => {
    if (navMethod === NavigationMethod.Replace) {
      router.replace(targetUrl);
    } else {
      router.push(targetUrl);
    }
  };

  /**
   * Creates a navigation handler function that handles audio player closing before navigation
   * for logged-out users. This is the main function exposed by the hook.
   *
   * @param {string} url - The URL to navigate to
   * @param {() => void} [logButtonCallback] - Optional callback for logging button clicks
   * @param {NavigationMethod} [method=NavigationMethod.Push] - Navigation method to use
   * @returns {NavigationHandler} A function to be used as an onClick handler
   */
  const navigateWithAudioHandling = (
    url: string,
    logButtonCallback?: () => void,
    method: NavigationMethod = NavigationMethod.Push,
  ): NavigationHandler => {
    return (e?: MouseEvent): void => {
      if (e) {
        e.preventDefault();
      }

      // Execute any logging callback if provided
      if (logButtonCallback) {
        logButtonCallback();
      }

      if (!isLoggedIn()) {
        // Close audio player first for logged-out users
        audioPlayerService.send({ type: 'CLOSE' } as AudioPlayerEventType);
        // Then navigate to login page with redirect
        navigate(getLoginNavigationUrl(url), method);
      } else {
        // For logged-in users, navigate directly
        navigate(url, method);
      }
    };
  };

  return {
    navigateWithAudioHandling,
  };
};

export default useAudioNavigation;
