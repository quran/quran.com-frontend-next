import React, { useContext } from 'react';

import { useSelector as useXstateSelector } from '@xstate/react';
import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import PauseIcon from '../../../public/icons/pause-outline.svg';
import PlayIcon from '../../../public/icons/play-outline.svg';
import Spinner from '../dls/Spinner/Spinner';
import styles from '../QuranReader/TranslationView/TranslationViewCell.module.scss';

import Button, {
  ButtonShape,
  ButtonSize,
  ButtonType,
  ButtonVariant,
} from 'src/components/dls/Button/Button';
import DataContext from 'src/contexts/DataContext';
import { getChapterData } from 'src/utils/chapter';
import { logButtonClick } from 'src/utils/eventLogger';
import { getChapterNumberFromKey, getVerseNumberFromKey, makeVerseKey } from 'src/utils/verse';
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
  const isVerseBeingPlayed = useXstateSelector(audioService, (state) => {
    const { surah, ayahNumber } = state.context;
    return (
      state.matches('VISIBLE.AUDIO_PLAYER_INITIATED.PLAYING') &&
      makeVerseKey(surah, ayahNumber) === verseKey
    );
  });
  const chapterId = getChapterNumberFromKey(verseKey);
  const verseNumber = getVerseNumberFromKey(verseKey);
  const isLoading = useXstateSelector(audioService, (state) => state.hasTag('loading'));
  const chaptersData = useContext(DataContext);
  const chapterData = getChapterData(chaptersData, chapterId.toString());

  const onPlayClicked = () => {
    // eslint-disable-next-line i18next/no-literal-string
    logButtonClick(`${isTranslationView ? 'translation_view' : 'reading_view'}_play_verse`);
    const { surah, ayahNumber } = audioService.getSnapshot().context;

    if (makeVerseKey(surah, ayahNumber) === verseKey) {
      audioService.send('TOGGLE');
    } else {
      audioService.send({ type: 'PLAY_AYAH', surah: chapterId, ayahNumber: verseNumber });
    }

    if (onActionTriggered) {
      onActionTriggered();
    }
  };

  const onPauseClicked = () => {
    // eslint-disable-next-line i18next/no-literal-string
    logButtonClick(`${isTranslationView ? 'translation_view' : 'reading_view'}_pause_verse`);
    audioService.send('TOGGLE');

    if (onActionTriggered) {
      onActionTriggered();
    }
  };

  if (isLoading)
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

  if (isVerseBeingPlayed)
    return (
      <Button
        variant={ButtonVariant.Ghost}
        size={ButtonSize.Small}
        tooltip={t('audio.player.pause')}
        onClick={onPauseClicked}
        className={classNames(styles.iconContainer, styles.verseAction, {
          [styles.fadedVerseAction]: isTranslationView,
        })}
        shape={ButtonShape.Circle}
      >
        <span className={styles.icon}>
          <PauseIcon />
        </span>
      </Button>
    );

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
