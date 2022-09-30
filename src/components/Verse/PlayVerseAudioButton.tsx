import React, { useContext } from 'react';

import { useSelector as useXstateSelector } from '@xstate/react';
import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import Spinner from '../dls/Spinner/Spinner';
import styles from '../QuranReader/TranslationView/TranslationViewCell.module.scss';

import Button, { ButtonShape, ButtonSize, ButtonType, ButtonVariant } from '@/dls/Button/Button';
import useGetQueryParamOrXstateValue from '@/hooks/useGetQueryParamOrXstateValue';
import PlayIcon from '@/icons/play-outline.svg';
import QueryParam from '@/types/QueryParam';
import { getChapterData } from '@/utils/chapter';
import { logButtonClick } from '@/utils/eventLogger';
import { getChapterNumberFromKey, getVerseNumberFromKey } from '@/utils/verse';
import DataContext from 'src/contexts/DataContext';
import { selectIsVerseLoading } from 'src/xstate/actors/audioPlayer/selectors';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

interface PlayVerseAudioProps {
  verseKey: string;
  timestamp: number;
  isTranslationView?: boolean;
  onActionTriggered?: () => void;
}
const PlayVerseAudioButton: React.FC<PlayVerseAudioProps> = ({
  verseKey,
  isTranslationView = true,
  onActionTriggered,
}) => {
  const audioService = useContext(AudioPlayerMachineContext);
  const { t } = useTranslation('common');
  const {
    value: reciterId,
    isQueryParamDifferent: reciterQueryParamDifferent,
  }: { value: number; isQueryParamDifferent: boolean } = useGetQueryParamOrXstateValue(
    QueryParam.Reciter,
  );

  const isVerseLoading = useXstateSelector(audioService, (state) =>
    selectIsVerseLoading(state, verseKey),
  );
  const chapterId = getChapterNumberFromKey(verseKey);
  const verseNumber = getVerseNumberFromKey(verseKey);
  const chaptersData = useContext(DataContext);
  const chapterData = getChapterData(chaptersData, chapterId.toString());

  const onPlayClicked = () => {
    // eslint-disable-next-line i18next/no-literal-string
    logButtonClick(`${isTranslationView ? 'translation_view' : 'reading_view'}_play_verse`);

    audioService.send({
      type: 'PLAY_AYAH',
      surah: chapterId,
      ayahNumber: verseNumber,
      reciterId: reciterQueryParamDifferent ? reciterId : undefined,
    });

    if (onActionTriggered) {
      onActionTriggered();
    }
  };

  if (isVerseLoading) {
    return (
      <Button
        size={ButtonSize.Small}
        tooltip={t('loading')}
        type={ButtonType.Success}
        shape={ButtonShape.Circle}
        variant={ButtonVariant.Ghost}
      >
        <Spinner />
      </Button>
    );
  }

  return (
    <Button
      size={ButtonSize.Small}
      tooltip={t('audio.player.play')}
      variant={ButtonVariant.Ghost}
      onClick={onPlayClicked}
      shouldFlipOnRTL={false}
      shape={ButtonShape.Circle}
      className={classNames(styles.iconContainer, styles.verseAction, {
        [styles.fadedVerseAction]: isTranslationView,
      })}
      ariaLabel={t('aria.play-surah', { surahName: chapterData.transliteratedName })}
    >
      <span className={classNames(styles.icon, styles.playIcon)}>
        <PlayIcon />
      </span>
    </Button>
  );
};
export default PlayVerseAudioButton;
