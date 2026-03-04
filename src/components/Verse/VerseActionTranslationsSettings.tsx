import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import TranslationsIcon from '@/icons/translation.svg';
import { setIsSettingsDrawerOpen, setSettingsView, SettingsView } from '@/redux/slices/navbar';

type VerseActionTranslationsSettingsProps = {
  onActionTriggered?: () => void;
};

const VerseActionTranslationsSettings = ({
  onActionTriggered,
}: VerseActionTranslationsSettingsProps) => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();

  // Open the settings drawer and navigate to the Translations settings view
  const onTranslationsSettingsClick = () => {
    dispatch(setSettingsView(SettingsView.Translation));
    dispatch(setIsSettingsDrawerOpen(true));
    onActionTriggered?.();
  };

  return (
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
  );
};

export default VerseActionTranslationsSettings;
