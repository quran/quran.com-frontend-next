import { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import BackwardIcon from '../../../public/icons/backward.svg';
import ForwardIcon from '../../../public/icons/forward.svg';

import { triggerSetCurrentTime } from './EventTriggers';

import { getChapterAudioData } from 'src/api';
import Button, { ButtonShape, ButtonVariant } from 'src/components/dls/Button/Button';
import useGetQueryParamOrReduxValue from 'src/hooks/useGetQueryParamOrReduxValue';
import {
  finishRepeatEachVerseProgress,
  resetRepeatEachVerseProgress,
  selectAudioData,
  selectIsInRepeatMode,
} from 'src/redux/slices/AudioPlayer/state';
import { selectHighlightedLocation } from 'src/redux/slices/QuranReader/highlightedLocation';
import { makeChapterAudioDataUrl } from 'src/utils/apiPaths';
import { getVerseTimingByVerseKey } from 'src/utils/audio';
import { getChapterData } from 'src/utils/chapter';
import { logButtonClick } from 'src/utils/eventLogger';
import { makeVerseKey } from 'src/utils/verse';
import QueryParam from 'types/QueryParam';

export enum SeekButtonType {
  NextAyah = 'nextAyah',
  PrevAyah = 'prevAyah',
}

type SeekButtonProps = {
  type: SeekButtonType;
  isLoading: boolean;
};
const SeekButton = ({ type, isLoading }: SeekButtonProps) => {
  const { t, lang } = useTranslation('common');
  const dispatch = useDispatch();
  const { highlightedChapter, highlightedVerse } = useSelector(selectHighlightedLocation);
  const { value: reciterId }: { value: number } = useGetQueryParamOrReduxValue(QueryParam.Reciter);
  const audioData = useSelector(selectAudioData);
  const isInRepeatMode = useSelector(selectIsInRepeatMode);
  const chapterData = useMemo(
    () => getChapterData(highlightedChapter?.toString()),
    [highlightedChapter],
  );

  const { data: chapterAudioData } = useSWRImmutable(
    reciterId && audioData?.chapterId
      ? makeChapterAudioDataUrl(reciterId, audioData?.chapterId, true)
      : null, // only fetch when reciterId and chapterId is available
    () => getChapterAudioData(reciterId, audioData?.chapterId, true),
  );

  const verseTimingData = chapterAudioData?.verseTimings || [];

  const onSeek = () => {
    // eslint-disable-next-line i18next/no-literal-string
    logButtonClick(`audio_player_${type}`);
    if (isInRepeatMode) {
      // when in repeatMode, finish the repeat progress for current ayah
      // otherwise the AudioRepeatManager will replay the current Ayah when we set the new timestamp
      if (type === SeekButtonType.NextAyah) dispatch(finishRepeatEachVerseProgress());
      else dispatch(resetRepeatEachVerseProgress(lang));
    }
    const newVerse = type === SeekButtonType.PrevAyah ? highlightedVerse - 1 : highlightedVerse + 1;
    const verseKey = makeVerseKey(highlightedChapter, newVerse);

    const selectedVerseTiming = getVerseTimingByVerseKey(verseKey, verseTimingData);
    triggerSetCurrentTime(selectedVerseTiming.timestampFrom / 1000); // AudioPlayer accept 'seconds' instead of 'ms'
  };

  // disable the button if loading, or chapterAudioData not available, or highlighted verse not available
  // or currently playing first verse or last verse
  const isDisabled =
    isLoading ||
    !highlightedChapter ||
    !highlightedVerse ||
    !chapterAudioData ||
    (type === SeekButtonType.PrevAyah && highlightedVerse <= 1) ||
    (type === SeekButtonType.NextAyah && highlightedVerse >= chapterData?.versesCount);

  return (
    <Button
      tooltip={
        type === SeekButtonType.PrevAyah
          ? t('audio.player.previous-ayah')
          : t('audio.player.next-ayah')
      }
      variant={ButtonVariant.Ghost}
      shape={ButtonShape.Circle}
      disabled={isDisabled}
      onClick={onSeek}
    >
      {type === SeekButtonType.PrevAyah ? <BackwardIcon /> : <ForwardIcon />}
    </Button>
  );
};

export default SeekButton;
