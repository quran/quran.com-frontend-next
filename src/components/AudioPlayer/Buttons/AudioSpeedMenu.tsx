import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import BackIcon from '../../../../public/icons/west.svg';

import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import { setPlaybackRate } from 'src/redux/slices/AudioPlayer/state';

const getPlaybackRateLabel = (playbackRate) => (playbackRate === 1 ? 'Normal' : playbackRate);
const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const AudioSpeedMenu = ({ onBack }) => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();

  const rates = playbackRates.map((playbackRate) => (
    <PopoverMenu.Item
      onClick={() => {
        dispatch(setPlaybackRate(playbackRate));
        onBack();
      }}
    >
      {getPlaybackRateLabel(playbackRate)}
    </PopoverMenu.Item>
  ));
  return (
    <>
      <PopoverMenu.Item icon={<BackIcon />} onClick={onBack}>
        {t('audio.playback-speed')}
      </PopoverMenu.Item>
      {rates}
    </>
  );
};

export default AudioSpeedMenu;
