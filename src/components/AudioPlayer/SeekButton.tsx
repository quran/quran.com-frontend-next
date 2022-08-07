import { useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';

import BackwardIcon from '../../../public/icons/backward.svg';
import ForwardIcon from '../../../public/icons/forward.svg';

import Button, { ButtonShape, ButtonVariant } from 'src/components/dls/Button/Button';
import { logButtonClick } from 'src/utils/eventLogger';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

export enum SeekButtonType {
  NextAyah = 'nextAyah',
  PrevAyah = 'prevAyah',
}

type SeekButtonProps = {
  type: SeekButtonType;
  isLoading: boolean;
};
const SeekButton = ({ type }: SeekButtonProps) => {
  const audioService = useContext(AudioPlayerMachineContext);

  const { t } = useTranslation('common');

  const onSeek = () => {
    // eslint-disable-next-line i18next/no-literal-string
    logButtonClick(`audio_player_${type}`);
    audioService.send({ type: type === SeekButtonType.NextAyah ? 'NEXT_AYAH' : 'PREV_AYAH' });

    // const newVerse = type === SeekButtonType.PrevAyah ? highlightedVerse - 1 : highlightedVerse + 1;
    // const verseKey = makeVerseKey(highlightedChapter, newVerse);

    // const selectedVerseTiming = getVerseTimingByVerseKey(verseKey, verseTimingData);
    // triggerSetCurrentTime(selectedVerseTiming.timestampFrom / 1000); // AudioPlayer accept 'seconds' instead of 'ms'
  };

  return (
    <Button
      tooltip={type === SeekButtonType.PrevAyah ? t('previous-ayah') : t('next-ayah')}
      variant={ButtonVariant.Ghost}
      shape={ButtonShape.Circle}
      onClick={onSeek}
    >
      {type === SeekButtonType.PrevAyah ? <BackwardIcon /> : <ForwardIcon />}
    </Button>
  );
};

export default SeekButton;
