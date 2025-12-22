import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import PopoverMenu from '@/components/dls/PopoverMenu/PopoverMenu';
import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import { useOverlayModal, OverlayType } from '@/hooks/useOverlayModal';
import BookOpenIcon from '@/icons/book-open.svg';
import { selectSelectedTafsirs } from '@/redux/slices/QuranReader/tafsirs';
import { WordVerse } from '@/types/Word';
import { logButtonClick } from '@/utils/eventLogger';
import { getVerseSelectedTafsirNavigationUrl } from '@/utils/navigation';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';

interface Props {
  verse: WordVerse;
  onActionTriggered?: () => void;
}

const TafsirMenuItem: React.FC<Props> = ({ verse, onActionTriggered }) => {
  const { t } = useTranslation('common');
  const tafsirs = useSelector(selectSelectedTafsirs);
  const { verseKey } = verse;
  const [chapterId, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);

  const { open } = useOverlayModal({
    verseKey,
    overlayType: OverlayType.TAFSIRS,
  });

  const onMenuItemClicked = () => {
    logButtonClick('reading_view_verse_actions_menu_tafsir');
    open(getVerseSelectedTafsirNavigationUrl(chapterId, Number(verseNumber), tafsirs[0]));
    onActionTriggered?.();
  };

  return (
    <PopoverMenu.Item
      icon={
        <IconContainer
          icon={<BookOpenIcon />}
          color={IconColor.tertiary}
          size={IconSize.Custom}
          shouldFlipOnRTL={false}
        />
      }
      onClick={onMenuItemClicked}
    >
      {t('quran-reader:tafsirs')}
    </PopoverMenu.Item>
  );
};

export default TafsirMenuItem;
