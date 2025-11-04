import React, { useContext, useMemo } from 'react';

import { useSelector } from '@xstate/react';
import useTranslation from 'next-translate/useTranslation';

import DataContext from '@/contexts/DataContext';
import Button, { ButtonShape, ButtonVariant } from '@/dls/Button/Button';
import BackwardIcon from '@/icons/backward.svg';
import ForwardIcon from '@/icons/forward.svg';
import { getChapterData } from '@/utils/chapter';
import { logButtonClick } from '@/utils/eventLogger';
import { AudioPlayerMachineContext } from '@/xstate/AudioPlayerMachineContext';

export enum SeekButtonType {
  NextAyah = 'nextAyah',
  PrevAyah = 'prevAyah',
}

type SeekButtonProps = {
  type: SeekButtonType;
  isLoading: boolean;
};

const SeekButton: React.FC<SeekButtonProps> = ({ type, isLoading }) => {
  const audioService = useContext(AudioPlayerMachineContext);
  const chaptersData = useContext(DataContext);

  const surah = useSelector(audioService, (state) => state.context.surah);
  const ayahNumber = useSelector(audioService, (state) => state.context.ayahNumber);

  const chapterData = useMemo(() => {
    if (!chaptersData || !surah) {
      return undefined;
    }
    return getChapterData(chaptersData, surah.toString());
  }, [chaptersData, surah]);

  const { t } = useTranslation('common');

  const onSeek = () => {
    // eslint-disable-next-line i18next/no-literal-string
    logButtonClick(`audio_player_${type}`);
    audioService.send({ type: type === SeekButtonType.NextAyah ? 'NEXT_AYAH' : 'PREV_AYAH' });
  };

  const isDisabled =
    isLoading ||
    (type === SeekButtonType.PrevAyah && ayahNumber <= 1) ||
    (type === SeekButtonType.NextAyah && ayahNumber >= (chapterData?.versesCount ?? 0));

  return (
    <Button
      tooltip={type === SeekButtonType.PrevAyah ? t('previous-ayah') : t('next-ayah')}
      variant={ButtonVariant.Ghost}
      shape={ButtonShape.Circle}
      onClick={onSeek}
      isDisabled={isDisabled}
      data-testid={type === SeekButtonType.PrevAyah ? 'audio-prev-ayah' : 'audio-next-ayah'}
    >
      {type === SeekButtonType.PrevAyah ? <BackwardIcon /> : <ForwardIcon />}
    </Button>
  );
};

export default SeekButton;
