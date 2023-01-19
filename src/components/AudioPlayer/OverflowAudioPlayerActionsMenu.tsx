import AudioPlayerOverflowMenuTrigger from './AudioPlayerOverflowMenuTrigger';
import OverflowAudioPlayActionsMenuBody from './OverflowAudioPlayActionsMenuBody';
import styles from './OverflowAudioPlayerActionsMenu.module.scss';

import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import useDirection from '@/hooks/useDirection';
import { logEvent } from '@/utils/eventLogger';

const OverflowAudioPlayerActionsMenu = () => {
  const direction = useDirection();

  const onOpenChange = (open: boolean) => {
    logEvent(`audio_player_overflow_menu_${open ? 'open' : 'close'}`);
  };

  return (
    <div dir={direction} className={styles.overriddenPopoverMenuContentPositioning}>
      <PopoverMenu
        isPortalled={false}
        isModal={false}
        trigger={<AudioPlayerOverflowMenuTrigger />}
        onOpenChange={onOpenChange}
      >
        <OverflowAudioPlayActionsMenuBody />
      </PopoverMenu>
    </div>
  );
};

export default OverflowAudioPlayerActionsMenu;
