import OverflowMenuIcon from '../../../public/icons/menu_more_horiz.svg';

import DownloadAudioButton from './Buttons/DownloadAudioButton';
import RepeatAudioButton from './RepeatButton';

import Button, { ButtonShape, ButtonVariant } from 'src/components/dls/Button/Button';
import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';

const OverflowAudioPlayerActionsMenu = () => {
  return (
    <PopoverMenu
      trigger={
        <Button tooltip="More" variant={ButtonVariant.Ghost} shape={ButtonShape.Circle}>
          <OverflowMenuIcon />
        </Button>
      }
    >
      <RepeatAudioButton />
      <DownloadAudioButton />
    </PopoverMenu>
  );
};

export default OverflowAudioPlayerActionsMenu;
