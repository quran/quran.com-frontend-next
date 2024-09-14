import React, { useCallback, useContext, useEffect } from 'react';

import { useSelector, useSelector as useXstateSelector } from '@xstate/react';
import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from '../QuranReader/TranslationView/TranslationViewCell.module.scss';

import Spinner from '@/components/dls/Spinner/Spinner';
import OnboardingEvent from '@/components/Onboarding/OnboardingChecklist/hooks/OnboardingEvent';
import { useOnboarding } from '@/components/Onboarding/OnboardingProvider';
import Button, { ButtonShape, ButtonSize, ButtonType, ButtonVariant } from '@/dls/Button/Button';
import useGetQueryParamOrXstateValue from '@/hooks/useGetQueryParamOrXstateValue';
import PlayIcon from '@/icons/play-outline.svg';
import OnboardingGroup from '@/types/OnboardingGroup';
import QueryParam from '@/types/QueryParam';
import { getChapterData } from '@/utils/chapter';
import { logButtonClick } from '@/utils/eventLogger';
import { getChapterNumberFromKey, getVerseNumberFromKey } from '@/utils/verse';
import DataContext from 'src/contexts/DataContext';
import { selectIsVerseLoading } from 'src/xstate/actors/audioPlayer/selectors';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

interface PlayVerseAudioProps {
  verseKey: string;
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
    QueryParam.RECITER,
  );
  const isVisible = useSelector(audioService, (state) => state.matches('VISIBLE'));
  const { isActive, activeStepGroup, nextStep } = useOnboarding();

  const isVerseLoading = useXstateSelector(audioService, (state) =>
    selectIsVerseLoading(state, verseKey),
  );
  const chapterId = getChapterNumberFromKey(verseKey);
  const verseNumber = getVerseNumberFromKey(verseKey);
  const chaptersData = useContext(DataContext);
  const chapterData = getChapterData(chaptersData, chapterId.toString());

  const onPlayClicked = useCallback(() => {
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

    // if the user clicks on the play button while the onboarding is active, we should automatically go to the next step
    if (isActive && activeStepGroup === OnboardingGroup.READING_EXPERIENCE && isVisible) {
      // audio player menu item step
      nextStep();
    }
  }, [
    activeStepGroup,
    audioService,
    chapterId,
    isActive,
    isTranslationView,
    isVisible,
    nextStep,
    onActionTriggered,
    reciterId,
    reciterQueryParamDifferent,
    verseNumber,
  ]);

  useEffect(() => {
    const handlePlayAudioStep = () => {
      onPlayClicked();
    };

    window.addEventListener(OnboardingEvent.STEP_AFTER_PLAY_AUDIO_CLICK, handlePlayAudioStep);

    return () => {
      window.removeEventListener(OnboardingEvent.STEP_AFTER_PLAY_AUDIO_CLICK, handlePlayAudioStep);
    };
  }, [nextStep, onPlayClicked]);

  if (isVerseLoading) {
    return (
      <Button
        size={ButtonSize.Small}
        tooltip={t('loading')}
        type={ButtonType.Success}
        shape={ButtonShape.Circle}
        variant={ButtonVariant.Ghost}
        className="play-audio-button" // this class is for onboarding
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
      id="play-verse-button" // this ID is for onboarding
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
