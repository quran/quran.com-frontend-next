import useTranslation from 'next-translate/useTranslation';

import { OverflowMenuIcon } from '../Icons';

import OverflowAudioPlayActionsMenuBody from './OverflowAudioPlayActionsMenuBody';
import styles from './OverflowAudioPlayerActionsMenu.module.scss';

import Button, { ButtonShape, ButtonVariant } from 'src/components/dls/Button/Button';
import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import useDirection from 'src/hooks/useDirection';
import { logEvent } from 'src/utils/eventLogger';

const OverflowAudioPlayerActionsMenu = () => {
  const { t } = useTranslation('common');
  const direction = useDirection();

  return (
    <div dir={direction} className={styles.overriddenPopoverMenuContentPositioning}>
      <PopoverMenu
        isPortalled={false}
        isModal={false}
        trigger={
          <Button tooltip={t('more')} variant={ButtonVariant.Ghost} shape={ButtonShape.Circle}>
            <OverflowMenuIcon />
          </Button>
        }
        onOpenChange={(open: boolean) => {
          logEvent(`audio_player_overflow_menu_${open ? 'open' : 'close'}`);
        }}
      >
        <OverflowAudioPlayActionsMenuBody />
      </PopoverMenu>
    </div>
  );
};

export default OverflowAudioPlayerActionsMenu;
