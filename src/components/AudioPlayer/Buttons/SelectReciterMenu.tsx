import React, { useCallback, useContext, useEffect } from 'react';

import { useSelector } from '@xstate/react';
import useTranslation from 'next-translate/useTranslation';

import styles from './SelectReciterMenu.module.scss';

import DataFetcher from '@/components/DataFetcher';
import { useOnboarding } from '@/components/Onboarding/OnboardingProvider';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import Spinner from '@/dls/Spinner/Spinner';
import usePersistPreferenceGroup from '@/hooks/auth/usePersistPreferenceGroup';
import CheckIcon from '@/icons/check.svg';
import ChevronLeftIcon from '@/icons/chevron-left.svg';
import OnboardingGroup from '@/types/OnboardingGroup';
import { makeAvailableRecitersUrl } from '@/utils/apiPaths';
import { logButtonClick, logItemSelectionChange, logValueChange } from '@/utils/eventLogger';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';
import { RecitersResponse } from 'types/ApiResponses';
import PreferenceGroup from 'types/auth/PreferenceGroup';
import Reciter from 'types/Reciter';

const DEFAULT_RECITATION_STYLE = 'Murattal';

const SelectReciterMenu = ({ onBack }) => {
  const { lang, t } = useTranslation('common');

  const audioService = useContext(AudioPlayerMachineContext);
  const selectedReciterId = useSelector(audioService, (state) => state.context.reciterId);

  const {
    actions: { onXstateSettingsChange },
    isLoading,
  } = usePersistPreferenceGroup();

  const { isActive, activeStepGroup, activeStepIndex, nextStep } = useOnboarding();

  useEffect(() => {
    if (
      isActive &&
      activeStepGroup === OnboardingGroup.READING_EXPERIENCE &&
      activeStepIndex === 3
    ) {
      nextStep();
    }
  }, [isActive, activeStepGroup, activeStepIndex, nextStep]);

  const onReciterSelected = useCallback(
    (reciter: Reciter) => {
      const previousReciterId = selectedReciterId;
      onXstateSettingsChange(
        'reciter',
        reciter.id,
        () => audioService.send({ type: 'CHANGE_RECITER', reciterId: reciter.id }),
        () => audioService.send({ type: 'CHANGE_RECITER', reciterId: previousReciterId }),
        PreferenceGroup.AUDIO,
        onBack,
      );
    },
    [audioService, onBack, onXstateSettingsChange, selectedReciterId],
  );

  const getItemIcon = useCallback(
    (reciterId: number, newlySelectedReciterId: number) => {
      if (newlySelectedReciterId === reciterId) {
        if (isLoading) {
          return <Spinner />;
        }
        return <CheckIcon />;
      }
      return <span />;
    },
    [isLoading],
  );

  const renderReciter = useCallback(
    (data: RecitersResponse) => {
      return (
        <div>
          {data.reciters.map((reciter) => (
            <PopoverMenu.Item
              key={reciter.id}
              icon={getItemIcon(reciter.id, selectedReciterId)}
              onClick={() => {
                logButtonClick('audio_player_overflow_menu_reciter_item');
                logValueChange('reciter', selectedReciterId, reciter.id);
                logItemSelectionChange('reciter', reciter.id);
                onReciterSelected(reciter);
              }}
            >
              {reciter.translatedName.name}
              {reciter.style.name !== DEFAULT_RECITATION_STYLE && (
                <p className={styles.reciterStyle}>{` - ${reciter.style.name}`}</p>
              )}
            </PopoverMenu.Item>
          ))}
        </div>
      );
    },
    [getItemIcon, selectedReciterId, onReciterSelected],
  );

  const reciters = (
    <div id="audio-player-reciter-list">
      <DataFetcher queryKey={makeAvailableRecitersUrl(lang)} render={renderReciter} />
    </div>
  );

  return (
    <>
      <PopoverMenu.Item
        icon={<ChevronLeftIcon />}
        onClick={onBack}
        shouldFlipOnRTL
        id="audio-player-reciter-select-item"
      >
        {t('audio.select-reciter')}
      </PopoverMenu.Item>
      <PopoverMenu.Divider />
      {reciters}
    </>
  );
};

export default SelectReciterMenu;
