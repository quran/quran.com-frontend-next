import React, { useCallback } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import CheckIcon from '../../../../public/icons/check.svg';
import ChevronLeftIcon from '../../../../public/icons/chevron-left.svg';

import DataFetcher from 'src/components/DataFetcher';
import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import useGetQueryParamOrReduxValue from 'src/hooks/useGetQueryParamOrReduxValue';
import { setReciterAndPauseAudio } from 'src/redux/slices/AudioPlayer/state';
import { makeRecitersUrl } from 'src/utils/apiPaths';
import { logButtonClick, logItemSelectionChange, logValueChange } from 'src/utils/eventLogger';
import { RecitersResponse } from 'types/ApiResponses';
import QueryParam from 'types/QueryParam';

const SelectReciterMenu = ({ onBack }) => {
  const { lang, t } = useTranslation('common');
  const { value: selectedReciterId }: { value: number } = useGetQueryParamOrReduxValue(
    QueryParam.Reciter,
  );

  const dispatch = useDispatch();

  const renderReciter = useCallback(
    (data: RecitersResponse) => {
      return (
        <div>
          {data.reciters.map((reciter) => (
            <PopoverMenu.Item
              key={reciter.id}
              icon={selectedReciterId === reciter.id ? <CheckIcon /> : <span />}
              onClick={() => {
                logButtonClick('audio_player_overflow_menu_reciter_item');
                logValueChange('reciter', selectedReciterId, reciter.id);
                logItemSelectionChange('reciter', reciter.id);
                dispatch(setReciterAndPauseAudio({ reciter, locale: lang }));
                onBack();
              }}
            >
              {reciter.name}
            </PopoverMenu.Item>
          ))}
        </div>
      );
    },
    [selectedReciterId, lang, dispatch, onBack],
  );

  const reciters = <DataFetcher queryKey={makeRecitersUrl(lang)} render={renderReciter} />;

  return (
    <>
      <PopoverMenu.Item icon={<ChevronLeftIcon />} onClick={onBack} shouldFlipOnRTL>
        {t('audio.select-reciter')}
      </PopoverMenu.Item>
      <PopoverMenu.Divider />
      {reciters}
    </>
  );
};

export default SelectReciterMenu;
