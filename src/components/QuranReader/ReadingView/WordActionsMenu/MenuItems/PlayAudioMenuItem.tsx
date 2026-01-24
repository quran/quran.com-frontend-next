import React, { useCallback, useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';

import PopoverMenu from '@/components/dls/PopoverMenu/PopoverMenu';
import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import PlayIcon from '@/icons/play-outline.svg';
import { logButtonClick } from '@/utils/eventLogger';
import { getChapterNumberFromKey, getVerseNumberFromKey } from '@/utils/verse';
import { selectIsVerseLoading } from '@/xstate/actors/audioPlayer/selectors';
import { AudioPlayerMachineContext } from '@/xstate/AudioPlayerMachineContext';

interface PlayAudioMenuItemProps {
  verse: {
    verseKey: string;
    timestamps?: any;
    chapterId?: string | number;
    verseNumber?: string | number;
  };
  onActionTriggered?: () => void;
}

const PlayAudioMenuItem: React.FC<PlayAudioMenuItemProps> = ({ verse, onActionTriggered }) => {
  const { verseKey } = verse;
  const audioService = useContext(AudioPlayerMachineContext);
  const { t } = useTranslation('common');

  // Extract chapter and verse numbers either from props or from the verseKey
  const chapterId = verse.chapterId || getChapterNumberFromKey(verseKey);
  const verseNumber = verse.verseNumber || getVerseNumberFromKey(verseKey);

  // Check if verse is currently loading
  const isVerseLoading = selectIsVerseLoading(audioService.state, verseKey);

  const onPlayClicked = useCallback(() => {
    logButtonClick('reading_view_play_verse');

    audioService.send({
      type: 'PLAY_AYAH',
      surah: Number(chapterId),
      ayahNumber: Number(verseNumber),
    });

    onActionTriggered?.();
  }, [audioService, chapterId, onActionTriggered, verseNumber]);

  return (
    <PopoverMenu.Item
      icon={
        <IconContainer
          icon={<PlayIcon />}
          color={IconColor.tertiary}
          size={IconSize.Custom}
          shouldFlipOnRTL={false}
        />
      }
      onClick={onPlayClicked}
      isDisabled={isVerseLoading}
    >
      {t('audio.player.play')}
    </PopoverMenu.Item>
  );
};

export default PlayAudioMenuItem;
