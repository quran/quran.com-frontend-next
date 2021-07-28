import { useEffect } from 'react';

const SEEK_DURATION_SECONDS = 5;

type MediaSessionAPIListenersProps = {
  play: () => void;
  pause: () => void;
  seek: (duration: number) => void;
  playPreviousTrack: () => void;
  playNextTrack: () => void;
};

const MediaSessionApiListeners = ({
  play,
  pause,
  seek,
  playPreviousTrack,
  playNextTrack,
}: MediaSessionAPIListenersProps) => {
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'Al Baqarah', // Placeholder
        artist: 'Al-Affasy', // Placeholder
        album: 'Quran.com',
        artwork: [
          { src: '/images/logo/Logo@96x96.png', sizes: '96x96', type: 'image/png' },
          { src: '/images/logo/Logo@128x128.png', sizes: '128x128', type: 'image/png' },
          { src: '/images/logo/Logo@192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/images/logo/Logo@256x256.png', sizes: '256x256', type: 'image/png' },
          { src: '/images/logo/Logo@384x384.png', sizes: '384x384', type: 'image/png' },
          { src: '/images/logo/Logo@512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      });
    }
  }, []);

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
