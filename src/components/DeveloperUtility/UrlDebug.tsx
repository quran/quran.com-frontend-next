import useAudioData from '../AudioPlayer/useAudioData';

const URLDebug = () => {
  const audioData = useAudioData();
  return (
    <div
      style={{
        width: '20rem',
        overflowX: 'scroll',
        direction: 'rtl',
      }}
    >
      {audioData.url}
    </div>
  );
};

export default URLDebug;
