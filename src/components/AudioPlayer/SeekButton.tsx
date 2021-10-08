import { useMemo } from 'react';

import { useSelector } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import NextIcon from '../../../public/icons/skip_next.svg';
import PrevIcon from '../../../public/icons/skip_previous.svg';

import { triggerSetCurrentTime } from './EventTriggers';

import { getChapterAudioData } from 'src/api';
import Button, { ButtonShape, ButtonVariant } from 'src/components/dls/Button/Button';
import { selectAudioData, selectReciter } from 'src/redux/slices/AudioPlayer/state';
import { selectHighlightedLocation } from 'src/redux/slices/QuranReader/highlightedLocation';
import { makeChapterAudioDataUrl } from 'src/utils/apiPaths';
import { getVerseTimingByVerseKey } from 'src/utils/audio';
import { getChapterData } from 'src/utils/chapter';
import { makeVerseKey } from 'src/utils/verse';

export enum SeekButtonType {
  NextAyah = 'nextAyah',
  PrevAyah = 'prevAyah',
}

type SeekButtonProps = {
  type: SeekButtonType;
  isLoading: boolean;
};
const SeekButton = ({ type, isLoading }: SeekButtonProps) => {
  const { highlightedChapter, highlightedVerse } = useSelector(selectHighlightedLocation);
  const reciter = useSelector(selectReciter);
  const audioData = useSelector(selectAudioData);
  const chapterData = useMemo(
    () => getChapterData(highlightedChapter?.toString()),
    [highlightedChapter],
  );

  const { data: chapterAudioData } = useSWRImmutable(
    reciter.id && audioData?.chapterId
      ? makeChapterAudioDataUrl(reciter.id, audioData?.chapterId, true)
      : null, // only fetch when reciterId and chapterId is available
    () => getChapterAudioData(reciter.id, audioData?.chapterId, true),
  );

  const verseTimingData = chapterAudioData?.verseTimings || [];

  const onSeek = () => {
    const verse = type === SeekButtonType.PrevAyah ? highlightedVerse - 1 : highlightedVerse + 1;
    const verseKey = makeVerseKey(highlightedChapter, verse);

    const selectedVerseTiming = getVerseTimingByVerseKey(verseKey, verseTimingData);
    triggerSetCurrentTime(selectedVerseTiming.timestampFrom / 1000); // AudioPlayer accept 'seconds' instead of 'ms'
  };

  // disable the button if loading, or chapterAudioData not available
  // or currently playing first verse or last verse
  const isDisabled =
    isLoading ||
    !chapterAudioData ||
    (type === SeekButtonType.PrevAyah && highlightedVerse <= 1) ||
    (type === SeekButtonType.NextAyah && highlightedVerse >= chapterData?.versesCount);

  return (
    <Button
      tooltip={type === SeekButtonType.PrevAyah ? 'Previous Ayah' : 'Next Ayah'}
      variant={ButtonVariant.Ghost}
      shape={ButtonShape.Circle}
      disabled={isDisabled}
      onClick={onSeek}
    >
      {type === SeekButtonType.PrevAyah ? <PrevIcon /> : <NextIcon />}
    </Button>
  );
};

export default SeekButton;
