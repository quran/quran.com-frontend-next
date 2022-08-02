/* eslint-disable max-lines */
/* eslint-disable import/no-unresolved */
/* eslint-disable react-func/max-lines-per-function */
import { useEffect, useState, useCallback, useRef } from 'react';

// @ts-ignore
import { AudioWorklet } from 'audio-worklet';

import { getAverageVolume } from 'src/audioInput/voice';
import useBrowserLayoutEffect from 'src/hooks/useBrowserLayoutEffect';
import { logEmptySearchResults, logEvent } from 'src/utils/eventLogger';
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

const useTarteelVoiceSearch = (startRecording = true) => {
  const [volume, setVolume] = useState<number>(0);
  const mediaStream = useRef<MediaStream>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<VoiceError>(null);
  const [partialTranscript, setPartialTranscript] = useState<string>(null);
  const [searchResult, setSearchResult] = useState<SearchResult>(null);
  const [isWaitingForPermission, setIsWaitingForPermission] = useState(false);

  const releaseMicrophone = useCallback(() => {
    if (mediaStream.current) {
      mediaStream.current.getAudioTracks().forEach((track) => {
        track.stop();
      });
    }
    setVolume(0);
  }, []);

  const isWebSocketOpen = useCallback((webSocket: WebSocket) => {
    return webSocket && webSocket.readyState === webSocket.OPEN;
  }, []);

  const stopFlow = useCallback(
    async (
      webSocket: WebSocket,
      analyser: AnalyserNode,
      micWorkletNode: AudioWorkletNode,
      micSourceNode: MediaStreamAudioSourceNode,
      audioContext: AudioContext,
    ) => {
      // if the websocket is still open, close it
      if (isWebSocketOpen(webSocket)) {
        webSocket.send(JSON.stringify(END_STREAM_DATA));
        webSocket.close();
      }
      releaseMicrophone();
      if (analyser) {
        analyser.disconnect();
      }
      if (micWorkletNode) {
        micWorkletNode.disconnect();
      }
      if (micSourceNode) {
        micSourceNode.disconnect();
      }
      if (audioContext.state === 'running') {
        await audioContext.close();
      }
    },
    [isWebSocketOpen, releaseMicrophone],
  );

  const onWebsocketMessage = useCallback(
    (
      message: MessageEvent,
      webSocket: WebSocket,
      analyser: AnalyserNode,
      micWorkletNode: AudioWorkletNode,
      micSourceNode: MediaStreamAudioSourceNode,
      audioContext: AudioContext,
    ) => {
      const result = JSON.parse(message.data) as Result;
      const { event, data } = result;
      switch (event) {
        case Event.SEARCH_LOADING:
          setIsLoading(true);
          break;
        case Event.SEARCH_RESULT:
          setIsLoading(false);
          setSearchResult(data as SearchResult);
          if (!(data as SearchResult).matches.length) {
            logEmptySearchResults(data.queryText, 'tarteel', 'voice');
          }
          stopFlow(webSocket, analyser, micWorkletNode, micSourceNode, audioContext);
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
    [stopFlow],
  );

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

  useEffect(() => {
    if (!startRecording) {
      return undefined;
    }
    // re-set fields in-case this is not the first time we are running the voice search
    setError(null);
    setPartialTranscript(null);
    setSearchResult(null);
    setIsWaitingForPermission(true);
    const audioContext = new window.AudioContext({ sampleRate: AUDIO_CONFIG.sampleRate });
    let micSourceNode = null as MediaStreamAudioSourceNode;
    let micWorkletNode = null as AudioWorkletNode;
    let webSocket = null as WebSocket;
    let analyser = null as AnalyserNode;
    // 1. Ask for the user permission to access the mic
    navigator.mediaDevices
      .getUserMedia({ audio: AUDIO_CONSTRAINTS })
      .then((stream) => {
        try {
          micSourceNode = audioContext.createMediaStreamSource(stream);
        } catch (err) {
          logEvent('voice_search_create_media_stream_error');
          // this will happen for Firefox users due to FF not accepting to change the sampleRate {@see https://bugzilla.mozilla.org/show_bug.cgi?id=1607781}
          stopFlow(webSocket, analyser, micWorkletNode, micSourceNode, audioContext);
          throw new Error(USER_MEDIA_NOT_SUPPORTED_ERROR);
        }
        // 2. Add the MicInputProcessor to the audioContext
        audioContext.audioWorklet
          .addModule(
            new AudioWorklet(new URL('src/audioInput/MicInputProcessor.ts', import.meta.url)),
          )
          .then(() => {
            logEvent('tarteel_websocket_initialize');
            setIsLoading(true);
            // 3. Start a new websocket
            webSocket = new WebSocket(
              `wss://voice-v2.tarteel.io/search/?Authorization=${process.env.NEXT_PUBLIC_TARTEEL_VS_API_KEY}`,
            );
            mediaStream.current = stream;
            webSocket.onopen = () => {
              logEvent('tarteel_websocket_open');
              setIsLoading(false);
              analyser = audioContext.createAnalyser();
              analyser.smoothingTimeConstant = ANALYSER_SMOOTHING_CONSTANT;
              analyser.fftSize = FAST_FOURIER_TRANSFORM_SIZE;
              const volumes = new Uint8Array(analyser.frequencyBinCount);
              micWorkletNode = new AudioWorkletNode(audioContext, 'MicInputProcessor');
              webSocket.send(JSON.stringify(START_STREAM_DATA));
              micSourceNode.connect(analyser);
              analyser.connect(micWorkletNode);
              micWorkletNode.connect(audioContext.destination);
              // Handling the data being posted from the MicInputProcessor.
              micWorkletNode.port.onmessage = (event) => {
                setVolume(getAverageVolume(analyser, volumes));
                // sometimes the processor hasn't sent the last bit of data yet but the websocket had already been closed.
                if (isWebSocketOpen(webSocket)) {
                  webSocket.send(event.data);
                }
              };
            };
            webSocket.onmessage = (message: MessageEvent) => {
              onWebsocketMessage(
                message,
                webSocket,
                analyser,
                micWorkletNode,
                micSourceNode,
                audioContext,
              );
            };
            webSocket.onerror = () => {
              logEvent('tarteel_websocket_error');
              setIsLoading(false);
              setError(VoiceError.SOCKET_ERROR);
              releaseMicrophone();
            };
          })
          .catch(() => {
            logEvent('voice_search_worklet_error');
            setError(VoiceError.WORKLET_ERROR);
          });
      })
      .catch((getUserMedia: Error) => {
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
      })
      .finally(() => {
        setIsWaitingForPermission(false);
      });
    // clean-up
    return () => {
      stopFlow(webSocket, analyser, micWorkletNode, micSourceNode, audioContext);
    };
  }, [isWebSocketOpen, onWebsocketMessage, stopFlow, startRecording, releaseMicrophone]);

  return {
    isLoading,
    error,
    partialTranscript,
    searchResult,
    volume,
    isWaitingForPermission,
  };
};

export default useTarteelVoiceSearch;
