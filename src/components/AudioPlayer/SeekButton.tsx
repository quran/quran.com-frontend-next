import { useSelector } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import ForwardIcon from '../../../public/icons/forward_10.svg';
import ReplayIcon from '../../../public/icons/replay_10.svg';

import { triggerSetCurrentTime } from './EventTriggers';

import { getChapterAudioData } from 'src/api';
import Button, { ButtonShape, ButtonVariant } from 'src/components/dls/Button/Button';
import { selectAudioData, selectReciter } from 'src/redux/slices/AudioPlayer/state';
import { selectHighlightedLocation } from 'src/redux/slices/QuranReader/highlightedLocation';
import { makeChapterAudioDataUrl } from 'src/utils/apiPaths';
import { getVerseTimingByVerseKey } from 'src/utils/audio';
import { makeVerseKey } from 'src/utils/verse';

export enum SeekButtonType {
  FastForward = 'fastForward',
  Rewind = 'rewind',
}

type SeekButtonProps = {
  type: SeekButtonType;
  isLoading: boolean;
};
const SeekButton = ({ type, isLoading }: SeekButtonProps) => {
  const { highlightedChapter, highlightedVerse } = useSelector(selectHighlightedLocation);
  const reciter = useSelector(selectReciter);
  const audioData = useSelector(selectAudioData);

  const { data: chapterAudioData } = useSWRImmutable(
    reciter.id && audioData?.chapterId
      ? makeChapterAudioDataUrl(reciter.id, audioData?.chapterId, true)
      : null, // only fetch when reciterId and chapterId is available
    () => getChapterAudioData(reciter.id, audioData?.chapterId, true),
  );

  const verseTimingData = chapterAudioData?.verseTimings || [];

  const onSeek = () => {
    const verse = type === SeekButtonType.Rewind ? highlightedVerse - 1 : highlightedVerse + 1; // TODO: handle min max verse
    const verseKey = makeVerseKey(highlightedChapter, verse);

    const selectedVerseTiming = getVerseTimingByVerseKey(verseKey, verseTimingData);
    triggerSetCurrentTime(selectedVerseTiming.timestampFrom / 1000); // AudioPlayer accept 'seconds' instead of 'ms'
  };

  return (
    <Button
      tooltip={type === SeekButtonType.Rewind ? 'Rewind 10 seconds' : 'Fast forward 10 seconds'}
      variant={ButtonVariant.Ghost}
      shape={ButtonShape.Circle}
      disabled={isLoading}
      onClick={onSeek}
    >
      {
        type === SeekButtonType.Rewind ? <ReplayIcon /> : <ForwardIcon /> // TODO: update icon
      }
    </Button>
  );
};

export default SeekButton;
