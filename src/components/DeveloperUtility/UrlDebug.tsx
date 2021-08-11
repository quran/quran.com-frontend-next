import { useSelector } from 'react-redux';

const URLDebug = () => {
  const audioData = useSelector((state: any) => state.audioPlayerState.audio.audioUrl);
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
