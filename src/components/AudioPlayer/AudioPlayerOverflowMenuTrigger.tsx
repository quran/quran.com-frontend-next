import React, { useContext } from 'react';

import { useSelector } from '@xstate/react';
import useTranslation from 'next-translate/useTranslation';

import RemainingRangeCount from './RemainingRangeCount';

import Wrapper from '@/components/Wrapper/Wrapper';
import Badge from '@/dls/Badge/Badge';
import Button, { ButtonShape, ButtonVariant } from '@/dls/Button/Button';
import OverflowMenuIcon from '@/icons/menu_more_horiz.svg';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

const AudioPlayerOverflowMenuTrigger: React.FC = () => {
  const { t } = useTranslation('common');
  const audioService = useContext(AudioPlayerMachineContext);
  const repeatActor = useSelector(audioService, (state) => state.context.repeatActor);
  const isInRepeatMode = !!repeatActor;
  return (
    <Wrapper
      shouldWrap={isInRepeatMode}
      wrapper={(children) => (
        <Badge
          content={
            isInRepeatMode && (
              <RemainingRangeCount rangeActor={repeatActor.getSnapshot().context.rangeCycleActor} />
            )
          }
        >
          {children}
        </Badge>
      )}
    >
      <Button
        tooltip={t('more')}
        variant={ButtonVariant.Ghost}
        shape={ButtonShape.Circle}
        id="audio-player-overflow-menu-trigger"
      >
        <OverflowMenuIcon />
      </Button>
    </Wrapper>
  );
};

export default AudioPlayerOverflowMenuTrigger;
