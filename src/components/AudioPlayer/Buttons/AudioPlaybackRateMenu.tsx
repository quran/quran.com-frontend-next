import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import CheckIcon from '../../../../public/icons/check.svg';
import ChevronLeftIcon from '../../../../public/icons/chevron-left.svg';

import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import { playbackRates } from 'src/components/Navbar/SettingsDrawer/AudioSection';
import { selectPlaybackRate, setPlaybackRate } from 'src/redux/slices/AudioPlayer/state';

const AudioPlaybackRateMenu = ({ onBack }) => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const currentPlaybackRate = useSelector(selectPlaybackRate);

  const getPlaybackRateLabel = (playbackRate) =>
    playbackRate === 1 ? t('audio.playback-normal') : playbackRate;

  const rates = playbackRates.map((playbackRate) => (
    <PopoverMenu.Item
      icon={playbackRate === currentPlaybackRate ? <CheckIcon /> : <span />}
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
      <PopoverMenu.Item shouldFlipOnRTL icon={<ChevronLeftIcon />} onClick={onBack}>
        {t('audio.playback-speed')}
      </PopoverMenu.Item>
      <PopoverMenu.Divider />
      {rates}
    </>
  );
};

export default AudioPlaybackRateMenu;
