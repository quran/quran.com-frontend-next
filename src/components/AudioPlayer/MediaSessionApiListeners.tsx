import { useCallback, useEffect } from 'react';

import { shallowEqual, useSelector } from 'react-redux';

import useCurrentStationInfo from '../Radio/useStationInfo';

import { getReciterData } from 'src/api';
import { selectAudioPlayerState } from 'src/redux/slices/AudioPlayer/state';
import { getChapterData } from 'src/utils/chapter';

const SEEK_DURATION_SECONDS = 5;

type MediaSessionApiListenersProps = {
  play: () => void;
  pause: () => void;
  seek: (duration: number) => void;
  playPreviousTrack: () => void;
  playNextTrack: () => void;
  locale: string;
};

const QURAN_COM_ARTWORK = [
  { src: '/images/logo/Logo@96x96.png', sizes: '96x96', type: 'image/png' },
  { src: '/images/logo/Logo@128x128.png', sizes: '128x128', type: 'image/png' },
  { src: '/images/logo/Logo@192x192.png', sizes: '192x192', type: 'image/png' },
  { src: '/images/logo/Logo@256x256.png', sizes: '256x256', type: 'image/png' },
  { src: '/images/logo/Logo@384x384.png', sizes: '384x384', type: 'image/png' },
  { src: '/images/logo/Logo@512x512.png', sizes: '512x512', type: 'image/png' },
];

const MediaSessionApiListeners = ({
  play,
  pause,
  seek,
  playPreviousTrack,
  playNextTrack,
  locale,
}: MediaSessionApiListenersProps) => {
  const audioPlayerState = useSelector(selectAudioPlayerState, shallowEqual);
  const stationInfo = useCurrentStationInfo();

  const { isRadioMode } = audioPlayerState;

  const getRadioMediaMetadata = useCallback(async () => {
    return new MediaMetadata({
      title: stationInfo.title,
      artist: stationInfo.description,
      album: 'Quran.com',
      // TODO: replace with station image
      artwork: QURAN_COM_ARTWORK,
    });
  }, [stationInfo.description, stationInfo.title]);

  const getAudioMediaMetadata = useCallback(async () => {
    if (!audioPlayerState.audioData?.chapterId) return null;

    const chapterData = getChapterData(audioPlayerState.audioData.chapterId.toString());
    const reciterData = await getReciterData(audioPlayerState.reciter.id.toString(), locale);

    return new MediaMetadata({
      title: chapterData.transliteratedName,
      artist: reciterData?.reciter?.translatedName?.name,
      album: 'Quran.com',
      // TODO: replace with reciter image
      artwork: QURAN_COM_ARTWORK,
    });
  }, [audioPlayerState.audioData?.chapterId, audioPlayerState.reciter?.id, locale]);

  useEffect(() => {
    if ('mediaSession' in navigator) {
      const mediaMetaData = isRadioMode ? getRadioMediaMetadata() : getAudioMediaMetadata();
      mediaMetaData.then((metaData) => {
        navigator.mediaSession.metadata = metaData;
      });
    }
  }, [getAudioMediaMetadata, getRadioMediaMetadata, isRadioMode]);

  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', play);
      navigator.mediaSession.setActionHandler('pause', pause);
      navigator.mediaSession.setActionHandler('previoustrack', playPreviousTrack);
      navigator.mediaSession.setActionHandler('nexttrack', playNextTrack);
    }
  }, [play, pause, playPreviousTrack, playNextTrack]);

  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('seekbackward', () => seek(-SEEK_DURATION_SECONDS));
      navigator.mediaSession.setActionHandler('seekforward', () => seek(SEEK_DURATION_SECONDS));
    }
  }, [seek]);

  return <></>;
};

export default MediaSessionApiListeners;
