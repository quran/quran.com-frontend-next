import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import CheckIcon from '../../../../public/icons/check.svg';
import ChevronLeftIcon from '../../../../public/icons/chevron-left.svg';

import DataFetcher from 'src/components/DataFetcher';
import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
// import { playbackRates } from 'src/components/Navbar/SettingsDrawer/AudioSection';
// import { selectPlaybackRate, setPlaybackRate } from 'src/redux/slices/AudioPlayer/state';
import { selectReciter, setReciterAndPauseAudio } from 'src/redux/slices/AudioPlayer/state';
import { makeRecitersUrl } from 'src/utils/apiPaths';
import { RecitersResponse } from 'types/ApiResponses';

// const getPlaybackRateLabel = (playbackRate) => (playbackRate === 1 ? 'Normal' : playbackRate);

const SelectReciterMenu = ({ onBack }) => {
  const { lang, t } = useTranslation('common');
  const selectedReciter = useSelector(selectReciter);
  const dispatch = useDispatch();

  const reciters = (
    <DataFetcher
      queryKey={makeRecitersUrl()}
      render={(data: RecitersResponse) => {
        return (
          <div>
            {data.reciters.map((reciter) => (
              <PopoverMenu.Item
                icon={selectedReciter.id === reciter.id ? <CheckIcon /> : <span />}
                onClick={() => {
                  dispatch(setReciterAndPauseAudio({ reciter, locale: lang }));
                  onBack();
                }}
              >
                {reciter.name}
              </PopoverMenu.Item>
            ))}
          </div>
        );
      }}
    />
  );

  return (
    <>
      <PopoverMenu.Item icon={<ChevronLeftIcon />} onClick={onBack} shouldFlipIconRTL>
        {t('audio.select-reciter')}
      </PopoverMenu.Item>
      <PopoverMenu.Divider />
      {reciters}
    </>
  );
};

export default SelectReciterMenu;
