import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import BackMenuItem from './MenuItems/BackMenuItem';
import VerseActionsMenuType from './types';

import PopoverMenu from '@/components/dls/PopoverMenu/PopoverMenu';
import WordByWordVerseAction from '@/components/QuranReader/ReadingView/WordByWordVerseAction';
import SaveToCollectionAction from '@/components/Verse/SaveToCollectionAction';
import VerseActionAdvancedCopy from '@/components/Verse/VerseActionAdvancedCopy';
import VerseActionRepeatAudio from '@/components/Verse/VerseActionRepeatAudio';
import { isLoggedIn } from '@/utils/auth/login';
import Verse from 'types/Verse';

interface Props {
  verse: Verse;
  onActionTriggered?: () => void;
  onMenuChange: (menu: VerseActionsMenuType) => void;
}

const MoreActionsMenu: React.FC<Props> = ({ verse, onActionTriggered, onMenuChange }) => {
  const { t } = useTranslation('common');

  return (
    <>
      <BackMenuItem
        onMenuChange={onMenuChange}
        label={t('more')}
        logAction="back_more_verse_actions_menu"
      />
      <PopoverMenu.Divider />

      {isLoggedIn() && <SaveToCollectionAction verse={verse} isTranslationView={false} />}
      <VerseActionAdvancedCopy
        onActionTriggered={onActionTriggered}
        verse={verse}
        isTranslationView={false}
      />
      <WordByWordVerseAction verse={verse} onActionTriggered={onActionTriggered} />
      <VerseActionRepeatAudio isTranslationView={false} verseKey={verse.verseKey} />
    </>
  );
};

export default MoreActionsMenu;
