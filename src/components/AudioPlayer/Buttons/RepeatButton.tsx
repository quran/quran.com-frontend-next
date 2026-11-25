import { useContext, useState } from 'react';

import { useSelector } from '@xstate/react';
import useTranslation from 'next-translate/useTranslation';

import RemainingRangeCount from '../RemainingRangeCount';

import RepeatAudioModal from '@/components/AudioPlayer/RepeatAudioModal/RepeatAudioModal';
import { RepetitionMode } from '@/components/AudioPlayer/RepeatAudioModal/SelectRepetitionMode';
import Wrapper from '@/components/Wrapper/Wrapper';
import Badge from '@/dls/Badge/Badge';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import RepeatIcon from '@/icons/repeat.svg';
import { logButtonClick } from '@/utils/eventLogger';
import { getChapterNumberFromKey } from '@/utils/verse';
import { selectIsLoading } from '@/xstate/actors/audioPlayer/selectors';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

type RepeatAudioButtonProps = {
  /**
   * When set (e.g. the verse opened in Study Mode), the repeat modal opens for this verse
   * instead of the whole surah that is currently playing.
   */
  selectedVerseKey?: string;
};

const RepeatAudioButton = ({ selectedVerseKey }: RepeatAudioButtonProps) => {
  const { t } = useTranslation('common');
  const audioService = useContext(AudioPlayerMachineContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentSurah = useSelector(audioService, (state) => state.context.surah);
  const isLoading = useSelector(audioService, selectIsLoading);
  const repeatActor = useSelector(audioService, (state) => state.context.repeatActor);
  const isInRepeatMode = !!repeatActor;

  const onButtonClicked = () => {
    logButtonClick('audio_player_repeat');
    setIsModalOpen(true);
  };

  return (
    <>
      <PopoverMenu.Item
        onClick={onButtonClicked}
        isDisabled={isLoading}
        icon={
          isLoading ? (
            <Spinner size={SpinnerSize.Large} />
          ) : (
            <Wrapper
              shouldWrap={isInRepeatMode}
              wrapper={(children) => (
                <Badge
                  content={
                    isInRepeatMode && (
                      <RemainingRangeCount
                        rangeActor={repeatActor.getSnapshot().context.rangeCycleActor}
                      />
                    )
                  }
                >
                  {children}
                </Badge>
              )}
            >
              <RepeatIcon />
            </Wrapper>
          )
        }
      >
        {t('audio.player.manage-repeat-settings')}
      </PopoverMenu.Item>
      {!isLoading && (
        <RepeatAudioModal
          defaultRepetitionMode={selectedVerseKey ? RepetitionMode.Single : RepetitionMode.Range}
          selectedVerseKey={selectedVerseKey}
          chapterId={
            selectedVerseKey
              ? getChapterNumberFromKey(selectedVerseKey).toString()
              : currentSurah.toString()
          }
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default RepeatAudioButton;
