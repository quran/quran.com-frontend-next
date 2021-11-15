import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import BackIcon from '../../../../public/icons/west.svg';

import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import { playbackRates } from 'src/components/Navbar/SettingsDrawer/AudioSection';
import { setPlaybackRate } from 'src/redux/slices/AudioPlayer/state';

const getPlaybackRateLabel = (playbackRate) => (playbackRate === 1 ? 'Normal' : playbackRate);

const AudioPlaybackRateMenu = ({ onBack }) => {
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
      <PopoverMenu.Divider />
      {rates}
    </>
  );
};

export default AudioPlaybackRateMenu;
