import useTranslation from 'next-translate/useTranslation';

import OverflowMenuIcon from '../../../public/icons/menu_more_horiz.svg';

import OverflowAudioPlayActionsMenuBody from './OverflowAudioPlayActionsMenuBody';
import styles from './OverflowAudioPlayerActionsMenu.module.scss';

import Button, { ButtonShape, ButtonVariant } from 'src/components/dls/Button/Button';
import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import useDirection from 'src/hooks/useDirection';

const OverflowAudioPlayerActionsMenu = () => {
  const { t } = useTranslation('common');
  const direction = useDirection();

  return (
    <div dir={direction} className={styles.overriddenPopoverMenuContentPositioning}>
      <PopoverMenu
        isPortalled={false}
        trigger={
          <Button tooltip={t('more')} variant={ButtonVariant.Ghost} shape={ButtonShape.Circle}>
            <OverflowMenuIcon />
          </Button>
        }
      >
        <OverflowAudioPlayActionsMenuBody />
      </PopoverMenu>
    </div>
  );
};

export default OverflowAudioPlayerActionsMenu;
