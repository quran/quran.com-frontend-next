import React, { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import PinVerseAction from '../PinVerseAction';
import TranslationFeedbackAction from '../TranslationFeedback/TranslationFeedbackAction';
import VerseActionAdvancedCopy from '../VerseActionAdvancedCopy';
import VerseActionEmbedWidget from '../VerseActionEmbedWidget';
import VerseActionRepeatAudio from '../VerseActionRepeatAudio';

import ShareVerseActionsMenu from './ShareVerseActionsMenu';

import VerseActionsMenuType from '@/components/QuranReader/ReadingView/WordActionsMenu/types';
import WordByWordVerseAction from '@/components/QuranReader/ReadingView/WordByWordVerseAction';
import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import SettingsIcon from '@/icons/settings.svg';
import TranslationsIcon from '@/icons/translation.svg';
import { setIsSettingsDrawerOpen, setSettingsView, SettingsView } from '@/redux/slices/navbar';
import { selectStudyModeIsOpen } from '@/redux/slices/QuranReader/studyMode';
import Verse from 'types/Verse';

interface Props {
  verse: Verse;
  isTranslationView: boolean;
  onActionTriggered?: () => void;
  isInsideStudyMode?: boolean;
}

const OverflowVerseActionsMenuBody: React.FC<Props> = ({
  verse,
  isTranslationView,
  onActionTriggered,
  isInsideStudyMode = false,
}) => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();

  const [selectedMenu, setSelectedMenu] = useState<VerseActionsMenuType>(VerseActionsMenuType.Main);
  const isStudyModeOpen = useSelector(selectStudyModeIsOpen);

  // Open the translations settings
  const onTranslationsSettingsClick = () => {
    dispatch(setSettingsView(SettingsView.Translation));
    dispatch(setIsSettingsDrawerOpen(true));
    onActionTriggered?.();
  };

  // Open the general settings
  const onSettingsClick = () => {
    dispatch(setSettingsView(SettingsView.Body));
    dispatch(setIsSettingsDrawerOpen(true));
    onActionTriggered?.();
  };

  return selectedMenu === VerseActionsMenuType.Main ? (
    <div>
      <PinVerseAction
        verse={verse}
        isTranslationView={isTranslationView}
        onActionTriggered={onActionTriggered}
      />
      <VerseActionAdvancedCopy
        onActionTriggered={onActionTriggered}
        verse={verse}
        isTranslationView={isTranslationView}
        isInsideStudyMode={isInsideStudyMode}
      />
      {!isStudyModeOpen && (
        <WordByWordVerseAction verse={verse} onActionTriggered={onActionTriggered} />
      )}
      {!isStudyModeOpen && (
        <VerseActionRepeatAudio isTranslationView={isTranslationView} verseKey={verse.verseKey} />
      )}
      <PopoverMenu.Item
        icon={
          <IconContainer
            icon={<TranslationsIcon />}
            color={IconColor.tertiary}
            size={IconSize.Custom}
            shouldFlipOnRTL={false}
          />
        }
        onClick={onTranslationsSettingsClick}
        shouldCloseMenuAfterClick
      >
        {t('translations')}
      </PopoverMenu.Item>
      <TranslationFeedbackAction
        verse={verse}
        isTranslationView={isTranslationView}
        onActionTriggered={onActionTriggered}
        isInsideStudyMode={isInsideStudyMode}
      />
      <VerseActionEmbedWidget
        verse={verse}
        isTranslationView={isTranslationView}
        onActionTriggered={onActionTriggered}
      />
      <PopoverMenu.Item
        icon={
          <IconContainer
            icon={<SettingsIcon />}
            color={IconColor.tertiary}
            size={IconSize.Custom}
            shouldFlipOnRTL={false}
          />
        }
        onClick={onSettingsClick}
        shouldCloseMenuAfterClick
      >
        {t('settings.title')}
      </PopoverMenu.Item>
    </div>
  ) : (
    <ShareVerseActionsMenu
      onActionTriggered={onActionTriggered}
      verse={verse}
      isTranslationView={isTranslationView}
      setSelectedMenu={setSelectedMenu}
    />
  );
};

export default OverflowVerseActionsMenuBody;
