/* eslint-disable jsx-a11y/anchor-is-valid */
import RepeatIcon from '../../../../public/icons/repeat.svg';
import ShareIcon from '../../../../public/icons/share.svg';
import UnBookmarkedIcon from '../../../../public/icons/unbookmarked.svg';

import PopoverMenu from './PopoverMenu';

export default {
  title: 'dls/PopoverMenu',
  component: PopoverMenu,
};

export const Normal = () => {
  return (
    <PopoverMenu isOpen>
      <PopoverMenu.Item>Dashboard</PopoverMenu.Item>

      <PopoverMenu.Divider />

      <PopoverMenu.Item>My Teams</PopoverMenu.Item>

      <PopoverMenu.Item icon={<RepeatIcon size={18} />}>Repeat</PopoverMenu.Item>

      <PopoverMenu.Divider />

      <PopoverMenu.Item>Logout</PopoverMenu.Item>
    </PopoverMenu>
  );
};

export const withIcon = () => {
  return (
    <PopoverMenu isOpen>
      <PopoverMenu.Item icon={<ShareIcon />}>Share</PopoverMenu.Item>

      <PopoverMenu.Divider />

      <PopoverMenu.Item icon={<UnBookmarkedIcon />}>Bookmark</PopoverMenu.Item>

      <PopoverMenu.Item icon={<RepeatIcon size={18} />}>Repeat</PopoverMenu.Item>

      <PopoverMenu.Divider />

      <PopoverMenu.Item>Logout</PopoverMenu.Item>
    </PopoverMenu>
  );
};

export const withIconDisabled = () => {
  return (
    <PopoverMenu isOpen>
      <PopoverMenu.Item icon={<ShareIcon />}>Share</PopoverMenu.Item>

      <PopoverMenu.Divider />

      <PopoverMenu.Item icon={<UnBookmarkedIcon />}>Bookmark</PopoverMenu.Item>

      <PopoverMenu.Item icon={<RepeatIcon size={18} />} isDisabled>
        Repeat
      </PopoverMenu.Item>

      <PopoverMenu.Divider />

      <PopoverMenu.Item isDisabled>Logout</PopoverMenu.Item>
    </PopoverMenu>
  );
};
