import { useState } from "react";

import useTranslation from "next-translate/useTranslation";
import { useRouter } from "next/router";

import { RepetitionMode } from "../AudioPlayer/RepeatAudioModal/SelectRepetitionMode";
import PopoverMenu from "../dls/PopoverMenu/PopoverMenu";

import RepeatAudioModal from "@/components/AudioPlayer/RepeatAudioModal/RepeatAudioModal";
import RepeatIcon from "@/icons/repeat.svg";
import { logEvent } from "@/utils/eventLogger";
import { fakeNavigate } from "@/utils/navigation";
import { getChapterNumberFromKey } from "@/utils/verse";

type VerseActionRepeatAudioProps = {
  verseKey: string;
  isTranslationView: boolean;
  onActionTriggered?: () => void;
};

const CLOSE_POPOVER_AFTER_MS = 0;

const VerseActionRepeatAudio = ({
  verseKey,
  onActionTriggered,
  isTranslationView,
}: VerseActionRepeatAudioProps) => {
  const { t } = useTranslation("common");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const chapterId = getChapterNumberFromKey(verseKey);
  const router = useRouter();

  const onModalClose = () => {
    if (isTranslationView) {
      logEvent("translation_view_tafsir_modal_close");
    } else {
      logEvent("reading_view_tafsir_modal_close");
    }
    setIsModalOpen(false);
    fakeNavigate(router.asPath, router.locale);
    if (onActionTriggered) {
      setTimeout(() => {
        // we set a really short timeout to close the popover after the modal has been closed to allow enough time for the fadeout css effect to apply.
        onActionTriggered();
      }, CLOSE_POPOVER_AFTER_MS);
    }
  };

  return (
    <>
      <RepeatAudioModal
        defaultRepetitionMode={RepetitionMode.Single}
        selectedVerseKey={verseKey}
        chapterId={chapterId.toString()}
        isOpen={isModalOpen}
        onClose={onModalClose}
      />
      <PopoverMenu.Item
        icon={<RepeatIcon />}
        onClick={() => {
          setIsModalOpen(true);
        }}
      >
        {t("audio.player.repeat-1-verse")}
      </PopoverMenu.Item>
    </>
  );
};

export default VerseActionRepeatAudio;
