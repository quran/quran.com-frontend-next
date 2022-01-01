import { useState, useMemo } from 'react';

import LinkIcon from '../../../../public/icons/east.svg';
import RepeatIcon from '../../../../public/icons/repeat.svg';
import ShareIcon from '../../../../public/icons/share.svg';
import TafsirIcon from '../../../../public/icons/tafsir.svg';
import UnBookmarkedIcon from '../../../../public/icons/unbookmarked.svg';
import BackIcon from '../../../../public/icons/west.svg';

import PopoverMenu from './PopoverMenu';

export default {
  title: 'dls/PopoverMenu',
  component: PopoverMenu,
};

export const unTriggered = () => {
  return (
    <PopoverMenu trigger={<button type="button">Trigger</button>}>
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
    <PopoverMenu isOpen trigger={<button type="button">Trigger</button>}>
      <PopoverMenu.Item icon={<TafsirIcon />}>Tafsirs</PopoverMenu.Item>
      <PopoverMenu.Item icon={<ShareIcon />}>Share</PopoverMenu.Item>
      <PopoverMenu.Item icon={<UnBookmarkedIcon />}>Bookmark</PopoverMenu.Item>
      <PopoverMenu.Item icon={<LinkIcon />}>Go to Ayah</PopoverMenu.Item>
    </PopoverMenu>
  );
};

export const withDivider = () => {
  return (
    <PopoverMenu isOpen trigger={<button type="button">test</button>}>
      <PopoverMenu.Item icon={<TafsirIcon />}>Tafsirs</PopoverMenu.Item>
      <PopoverMenu.Item icon={<ShareIcon />}>Share</PopoverMenu.Item>
      <PopoverMenu.Item icon={<UnBookmarkedIcon />}>Bookmark</PopoverMenu.Item>
      <PopoverMenu.Item icon={<LinkIcon />}>Go to Ayah</PopoverMenu.Item>
      <PopoverMenu.Item icon={<ShareIcon />}>Share</PopoverMenu.Item>
      <PopoverMenu.Divider />
      <PopoverMenu.Item>Logout</PopoverMenu.Item>
    </PopoverMenu>
  );
};

export const withIconDisabled = () => {
  return (
    <PopoverMenu isOpen trigger={<button type="button">test</button>}>
      <PopoverMenu.Item icon={<ShareIcon />}>Share</PopoverMenu.Item>
      <PopoverMenu.Item icon={<UnBookmarkedIcon />}>Bookmark</PopoverMenu.Item>
      <PopoverMenu.Item icon={<RepeatIcon size={18} />} isDisabled>
        Repeat
      </PopoverMenu.Item>
      <PopoverMenu.Divider />
      <PopoverMenu.Item isDisabled>Logout</PopoverMenu.Item>
    </PopoverMenu>
  );
};

export const WithSubMenu = () => {
  const [selection, setSelection] = useState<'parent' | 'speed'>('parent');

  const menus = useMemo(() => {
    return {
      parent: [
        <PopoverMenu.Item key={0}>Download Audio</PopoverMenu.Item>,
        <PopoverMenu.Item
          key={1}
          onClick={() => setSelection('speed')}
          icon={<RepeatIcon size={18} />}
        >
          Audio speed
        </PopoverMenu.Item>,
        <PopoverMenu.Divider key={2} />,
        <PopoverMenu.Item key={3}>Close Audio Player</PopoverMenu.Item>,
      ],
      speed: [
        <PopoverMenu.Item key={0} icon={<BackIcon />} onClick={() => setSelection('parent')}>
          Audio Speed
        </PopoverMenu.Item>,
        <PopoverMenu.Divider key={1} />,
        <PopoverMenu.Item key={2}>Logout</PopoverMenu.Item>,
      ],
    };
  }, []);

  return (
    <PopoverMenu trigger={<button type="button">Trigger</button>}>{menus[selection]}</PopoverMenu>
  );
};
