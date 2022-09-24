/* eslint-disable react/jsx-key */
/* eslint-disable react/no-multi-comp */
import { useState, useMemo } from 'react';

import PopoverMenu from './PopoverMenu';

import LinkIcon from '@/icons/east.svg';
import RepeatIcon from '@/icons/repeat.svg';
import ShareIcon from '@/icons/share.svg';
import TafsirIcon from '@/icons/tafsir.svg';
import UnBookmarkedIcon from '@/icons/unbookmarked.svg';
import BackIcon from '@/icons/west.svg';

export default {
  title: 'dls/PopoverMenu',
  component: PopoverMenu,
  argTypes: {
    isPortalled: {
      control: {
        type: 'boolean',
      },
      defaultValue: false,
      table: {
        category: 'Optional',
      },
    },
    children: {
      table: {
        category: 'Required',
      },
    },
  },
};

const UnTriggeredTemplate = (args) => {
  return (
    <PopoverMenu trigger={<button type="button">Trigger</button>} {...args}>
      <PopoverMenu.Item>Dashboard</PopoverMenu.Item>

      <PopoverMenu.Divider />

      <PopoverMenu.Item>My Teams</PopoverMenu.Item>

      <PopoverMenu.Item icon={<RepeatIcon size={18} />}>Repeat</PopoverMenu.Item>

      <PopoverMenu.Divider />

      <PopoverMenu.Item>Logout</PopoverMenu.Item>
    </PopoverMenu>
  );
};

export const UnTriggered = UnTriggeredTemplate.bind({});

const WithIconTemplate = (args) => {
  return (
    <PopoverMenu trigger={<button type="button">Trigger</button>} {...args}>
      <PopoverMenu.Item icon={<TafsirIcon />}>Tafsirs</PopoverMenu.Item>
      <PopoverMenu.Item icon={<ShareIcon />}>Share</PopoverMenu.Item>
      <PopoverMenu.Item icon={<UnBookmarkedIcon />}>Bookmark</PopoverMenu.Item>
      <PopoverMenu.Item icon={<LinkIcon />}>Go to Ayah</PopoverMenu.Item>
    </PopoverMenu>
  );
};

export const WithIcon = WithIconTemplate.bind({});

const WithDivider = (args) => {
  return (
    <PopoverMenu trigger={<button type="button">Trigger</button>} {...args}>
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

export const WithDividerTemplate = WithDivider.bind({});

const WithIconDisabledTemplate = (args) => {
  return (
    <PopoverMenu trigger={<button type="button">Trigger</button>} {...args}>
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

export const WithIconDisabled = WithIconDisabledTemplate.bind({});

const WithSubMenuTemplate = (args) => {
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
    <PopoverMenu trigger={<button type="button">Trigger</button>} {...args}>
      {menus[selection]}
    </PopoverMenu>
  );
};

export const WithSubMenu = WithSubMenuTemplate.bind({});
