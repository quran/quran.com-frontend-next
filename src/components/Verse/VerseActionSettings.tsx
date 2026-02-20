import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import SettingsIcon from '@/icons/settings.svg';
import { setIsSettingsDrawerOpen, setSettingsView, SettingsView } from '@/redux/slices/navbar';

type VerseActionSettingsProps = {
  onActionTriggered?: () => void;
};

const VerseActionSettings = ({ onActionTriggered }: VerseActionSettingsProps) => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();

  // Open the settings drawer
  const onSettingsClick = () => {
    dispatch(setSettingsView(SettingsView.Body));
    dispatch(setIsSettingsDrawerOpen(true));
    onActionTriggered?.();
  };

  return (
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
  );
};

export default VerseActionSettings;
