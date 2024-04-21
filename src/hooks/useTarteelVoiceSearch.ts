/* eslint-disable max-lines */
/* eslint-disable import/no-unresolved */
/* eslint-disable react-func/max-lines-per-function */
import { useState, useCallback, useRef } from 'react';

// @ts-ignore
import { AudioWorklet } from 'audio-worklet';

import useBrowserLayoutEffect from '@/hooks/useBrowserLayoutEffect';
import SearchService from '@/types/Search/SearchService';
import SearchQuerySource from '@/types/SearchQuerySource';
import SearchType from '@/types/SearchType';
import { logEmptySearchResults, logEvent } from '@/utils/eventLogger';
import { getAverageVolume } from 'src/audioInput/voice';
import Event from 'types/Tarteel/Event';
import Result from 'types/Tarteel/Result';
import SearchResult from 'types/Tarteel/SearchResult';
import VoiceError from 'types/Tarteel/VoiceError';

const AUDIO_CONFIG = {
  sampleRate: 16000,
  fileFormat: 'WAV',
  channels: 1,
};

const END_STREAM_DATA = {
  event: Event.END_STREAM,
};
const START_STREAM_DATA = {
  event: Event.START_STREAM,
  data: {
    audioConfig: AUDIO_CONFIG,
  },
};

const AUDIO_CONSTRAINTS = {
  sampleRate: AUDIO_CONFIG.sampleRate,
  channelCount: AUDIO_CONFIG.channels,
  sampleSize: 4096,
} as MediaTrackConstraints;

const USER_MEDIA_NOT_SUPPORTED_ERROR = 'USER_MEDIA_NOT_SUPPORTED';
const ANALYSER_SMOOTHING_CONSTANT = 0.8;
const FAST_FOURIER_TRANSFORM_SIZE = 1024;

const isWebSocketOpen = (webSocket: WebSocket) => {
  return webSocket && webSocket.readyState === webSocket.OPEN;
};

const useTarteelVoiceSearch = () => {
  const [volume, setVolume] = useState<number>(0);
  const mediaStream = useRef<MediaStream>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<VoiceError>(null);
  const [partialTranscript, setPartialTranscript] = useState<string>(null);
  const [searchResult, setSearchResult] = useState<SearchResult>(null);
  const [isWaitingForPermission, setIsWaitingForPermission] = useState(false);

  const websocket = useRef<WebSocket>(null);
  const analyser = useRef<AnalyserNode>(null);
  const micWorkletNode = useRef<AudioWorkletNode>(null);
  const audioContext = useRef<AudioContext>(null);
  const micSourceNode = useRef<MediaStreamAudioSourceNode>(null);

  useBrowserLayoutEffect(() => {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    // Older browsers might not implement mediaDevices at all, so we set an empty object first
    if (navigator.mediaDevices === undefined) {
      // @ts-ignore
      navigator.mediaDevices = {};
    }
    // Some browsers partially implement mediaDevices. We can't just assign an object
    // with getUserMedia as it would overwrite existing properties.
    // Here, we will just add the getUserMedia property if it's missing.
    if (navigator.mediaDevices.getUserMedia === undefined) {
      navigator.mediaDevices.getUserMedia = (constraints: MediaStreamConstraints) => {
        // First get ahold of the legacy getUserMedia, if present
        const getUserMedia =
          // @ts-ignore
          navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.getUserMedia;

        // Some browsers just don't implement it - return a rejected promise with an error
        // to keep a consistent interface
        if (!getUserMedia) {
          return Promise.reject(new Error(USER_MEDIA_NOT_SUPPORTED_ERROR));
        }

        // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
        return new Promise((resolve, reject) => {
          getUserMedia.call(navigator, constraints, resolve, reject);
        });
      };
    }
  }, []);

  const releaseMicrophone = useCallback(() => {
    if (mediaStream.current) {
      mediaStream.current.getAudioTracks().forEach((track) => {
        track.stop();
      });
    }
    setVolume(0);
  }, []);

  // the `closeWebsocket` param is used to close the websocket when the user clicks exits the flow.
  // otherwise, the user just clicked on the mic button to stop the recording
  // and the websocket should remain open to receive the final results.
  const stopRecording = useCallback(
    async (closeWebsocket = true) => {
      if (!closeWebsocket && !partialTranscript) {
        // if the user didn't say anything and clicked on the mic button, don't stop the flow
        return;
      }

      // if the websocket is still open, close it
      if (isWebSocketOpen(websocket.current)) {
        websocket.current.send(JSON.stringify(END_STREAM_DATA));
        if (closeWebsocket) {
          websocket.current.close();
        }
      }

      releaseMicrophone();
      if (analyser) {
        analyser.current.disconnect();
      }
      if (micWorkletNode) {
        micWorkletNode.current.disconnect();
      }
      if (micSourceNode) {
        micSourceNode.current.disconnect();
      }
      if (audioContext.current.state === 'running') {
        await audioContext.current.close();
      }
    },
    [releaseMicrophone, partialTranscript],
  );

  const onWebsocketMessage = useCallback(
    (message: MessageEvent) => {
      const result = JSON.parse(message.data) as Result;
      const { event, data } = result;
      switch (event) {
        case Event.SEARCH_LOADING:
          setIsLoading(true);
          break;
        case Event.SEARCH_RESULT:
          setIsLoading(false);
          setSearchResult(data as SearchResult);
          if (!(data as SearchResult).matches?.length) {
            logEmptySearchResults({
              query: data.queryText,
              source: SearchQuerySource.Tarteel,
              type: SearchType.Voice,
              service: SearchService.Tarteel,
            });
          }
          stopRecording();
          break;
        case Event.PARTIAL_TRANSCRIPT:
          setIsLoading(false);
          setPartialTranscript(data.queryText);
          break;
        case Event.ERROR:
          setIsLoading(false);
          logEvent('tarteel_error', { error: event });
          setError(VoiceError.RESPONSE_ERROR);
          break;
        default:
          break;
      }
    },
    [stopRecording],
  );

  const addMicInputProcessorToAudioContext = useCallback(async () => {
    try {
      await audioContext.current.audioWorklet.addModule(
        new AudioWorklet(new URL('src/audioInput/MicInputProcessor.ts', import.meta.url)),
      );
      logEvent('tarteel_websocket_initialize');
      setIsLoading(true);

      // 3. Start a new websocket
      websocket.current = new WebSocket(
        `wss://voice-v2.tarteel.io/search/?Authorization=${process.env.NEXT_PUBLIC_TARTEEL_VS_API_KEY}`,
      );

      websocket.current.onopen = () => {
        logEvent('tarteel_websocket_open');
        setIsLoading(false);
        analyser.current = audioContext.current.createAnalyser();
        analyser.current.smoothingTimeConstant = ANALYSER_SMOOTHING_CONSTANT;
        analyser.current.fftSize = FAST_FOURIER_TRANSFORM_SIZE;
        const volumes = new Uint8Array(analyser.current.frequencyBinCount);
        micWorkletNode.current = new AudioWorkletNode(audioContext.current, 'MicInputProcessor');
        websocket.current.send(JSON.stringify(START_STREAM_DATA));
        micSourceNode.current.connect(analyser.current);
        analyser.current.connect(micWorkletNode.current);
        micWorkletNode.current.connect(audioContext.current.destination);
        // Handling the data being posted from the MicInputProcessor.
        micWorkletNode.current.port.onmessage = (event) => {
          setVolume(getAverageVolume(analyser.current, volumes));
          // sometimes the processor hasn't sent the last bit of data yet but the websocket had already been closed.
          if (isWebSocketOpen(websocket.current)) {
            websocket.current.send(event.data);
          }
        };
      };

      websocket.current.onmessage = (message: MessageEvent) => {
        onWebsocketMessage(message);
      };

      websocket.current.onerror = () => {
        logEvent('tarteel_websocket_error');
        setIsLoading(false);
        setError(VoiceError.SOCKET_ERROR);
        releaseMicrophone();
      };
    } catch (err) {
      logEvent('voice_search_worklet_error');
      setError(VoiceError.WORKLET_ERROR);
    }
  }, [onWebsocketMessage, releaseMicrophone]);

  const startRecording = useCallback(async () => {
    // re-set fields in-case this is not the first time we are running the voice search
    setError(null);
    setPartialTranscript(null);
    setSearchResult(null);
    setIsWaitingForPermission(true);

    audioContext.current = new window.AudioContext({ sampleRate: AUDIO_CONFIG.sampleRate });

    try {
      // 1. Ask for the user permission to access the mic
      const stream = await navigator.mediaDevices.getUserMedia({ audio: AUDIO_CONSTRAINTS });
      mediaStream.current = stream;
      try {
        micSourceNode.current = audioContext.current.createMediaStreamSource(stream);
      } catch (err) {
        logEvent('voice_search_create_media_stream_error');
        // this will happen for Firefox users due to FF not accepting to change the sampleRate {@see https://bugzilla.mozilla.org/show_bug.cgi?id=1607781}
        stopRecording();
        throw new Error(USER_MEDIA_NOT_SUPPORTED_ERROR);
      }

      // 2. Add the MicInputProcessor to the audioContext
      await addMicInputProcessorToAudioContext();
    } catch (getUserMedia) {
      // if it's a custom thrown error when getUserMedia is not implemented in the browser
      if (getUserMedia.message === USER_MEDIA_NOT_SUPPORTED_ERROR) {
        logEvent('voice_search_not_supported');
        setError(VoiceError.NOT_SUPPORTED);
      } else {
        const isPermissionDenied = getUserMedia.name === 'NotAllowedError';
        if (isPermissionDenied) {
          logEvent('voice_search_permission_denied');
        }
        setError(isPermissionDenied ? VoiceError.NO_PERMISSION : VoiceError.GENERAL_ERROR);
      }
    } finally {
      setIsWaitingForPermission(false);
    }
  }, [stopRecording, addMicInputProcessorToAudioContext]);

  return {
    isLoading,
    error,
    partialTranscript,
    searchResult,
    volume,
    isWaitingForPermission,
    startRecording,
    stopRecording,
  };
};

export default useTarteelVoiceSearch;
